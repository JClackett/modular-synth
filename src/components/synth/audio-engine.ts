// Audio Engine for the Modular Synthesizer

class AudioEngine {
  private audioContext: AudioContext | null = null
  private nodes: Map<string, any> = new Map() // Changed to 'any' to store more complex objects
  private connections: Map<string, Set<string>> = new Map()
  private nodeParams: Map<string, any> = new Map()
  private nodeTypes: Map<string, string> = new Map()
  private modulationConnections: Map<string, any> = new Map() // Track modulation connections
  private midiNotes: Map<string, Map<number, any>> = new Map() // Track MIDI notes for each MIDI node
  private isInitialized = false
  private debugMode = true // Enable debug mode

  private initialize() {
    if (!this.isInitialized) {
      this.audioContext = new AudioContext()
      this.isInitialized = true
      if (this.debugMode) console.log("Audio context initialized")
    }
  }

  public start() {
    this.initialize()
    if (this.audioContext?.state === "suspended") {
      this.audioContext.resume()
      if (this.debugMode) console.log("Audio context resumed")
    }
  }

  public stop() {
    if (this.audioContext?.state === "running") {
      this.audioContext.suspend()
      if (this.debugMode) console.log("Audio context suspended")
    }
  }

  public cleanup() {
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
      if (this.debugMode) console.log("Audio context closed")
    }
    this.nodes.clear()
    this.connections.clear()
    this.nodeParams.clear()
    this.nodeTypes.clear()
    this.modulationConnections.clear()
    this.midiNotes.clear()
    this.isInitialized = false
  }

  public createNode(id: string, type: string, params: any) {
    this.initialize()
    if (!this.audioContext) return

    // Store node type and parameters
    this.nodeTypes.set(id, type)
    this.nodeParams.set(id, { ...params })

    if (this.debugMode) console.log(`Creating node: ${id}, type: ${type}`, params)

    // Create the audio node based on type
    switch (type) {
      case "oscillator": {
        const osc = this.audioContext.createOscillator()
        osc.type = params.waveform as OscillatorType
        osc.frequency.value = params.frequency || 440
        osc.detune.value = params.detune || 0
        osc.start()

        // Store the node with its parameters for modulation
        this.nodes.set(id, {
          node: osc,
          params: {
            frequency: osc.frequency,
            detune: osc.detune,
          },
        })
        break
      }

      case "filter": {
        const filter = this.audioContext.createBiquadFilter()
        filter.type = params.type as BiquadFilterType
        filter.frequency.value = params.frequency || 1000
        filter.Q.value = params.Q || 1

        // Store the node with its parameters for modulation
        this.nodes.set(id, {
          node: filter,
          params: {
            frequency: filter.frequency,
            Q: filter.Q,
          },
        })
        break
      }

      case "amplifier": {
        const gain = this.audioContext.createGain()
        gain.gain.value = params.gain || 0.5

        // Store the node with its parameters for modulation
        this.nodes.set(id, {
          node: gain,
          params: {
            gain: gain.gain,
          },
        })
        break
      }

      case "lfo": {
        const lfo = this.audioContext.createOscillator()
        const lfoGain = this.audioContext.createGain()

        lfo.type = params.waveform as OscillatorType
        lfo.frequency.value = params.frequency || 1

        // Calculate the effective amplitude based on amplitude and modDepth
        const effectiveAmplitude = (params.amplitude || 0.5) * (params.modDepth || 1.0)
        lfoGain.gain.value = effectiveAmplitude

        lfo.connect(lfoGain)
        lfo.start()

        // Store both the oscillator and gain nodes
        this.nodes.set(id, {
          node: lfoGain, // The output node
          oscillator: lfo, // The oscillator node
          params: {
            frequency: lfo.frequency,
            amplitude: lfoGain.gain,
          },
        })

        if (this.debugMode) console.log(`LFO created with frequency ${lfo.frequency.value}Hz and amplitude ${lfoGain.gain.value}`)
        break
      }

      case "midi": {
        // Create a summing node for all MIDI notes
        const outputGain = this.audioContext.createGain()
        outputGain.gain.value = 1.0

        // Initialize the MIDI notes map for this node
        this.midiNotes.set(id, new Map())

        // Store the node
        this.nodes.set(id, {
          node: outputGain,
          params: {},
          type: "midi",
        })

        if (this.debugMode) console.log(`MIDI node created: ${id}`)
        break
      }

      case "output": {
        const output = this.audioContext.createGain()
        output.gain.value = params.volume || 0.7
        output.connect(this.audioContext.destination)

        // Store the node with its parameters for modulation
        this.nodes.set(id, {
          node: output,
          params: {
            volume: output.gain,
          },
        })
        break
      }
    }
  }

  public updateNodeParameters(id: string, params: any) {
    this.initialize() // Ensure audio context is initialized
    if (!this.audioContext) return

    // Update stored parameters
    const currentParams = this.nodeParams.get(id) || {}
    this.nodeParams.set(id, { ...currentParams, ...params })

    const nodeType = this.nodeTypes.get(id)
    const nodeData = this.nodes.get(id)

    if (!nodeType || !nodeData) return

    if (this.debugMode) console.log(`Updating node: ${id}, type: ${nodeType}`, params)

    switch (nodeType) {
      case "oscillator": {
        const osc = nodeData.node as OscillatorNode
        if (params.waveform !== undefined) osc.type = params.waveform as OscillatorType
        if (params.frequency !== undefined) osc.frequency.value = params.frequency
        if (params.detune !== undefined) osc.detune.value = params.detune
        break
      }

      case "filter": {
        const filter = nodeData.node as BiquadFilterNode
        if (params.type !== undefined) filter.type = params.type as BiquadFilterType
        if (params.frequency !== undefined) filter.frequency.value = params.frequency
        if (params.Q !== undefined) filter.Q.value = params.Q
        break
      }

      case "amplifier": {
        const gain = nodeData.node as GainNode
        if (params.gain !== undefined) gain.gain.value = params.gain
        break
      }

      case "lfo": {
        const lfo = nodeData.oscillator as OscillatorNode
        const lfoGain = nodeData.node as GainNode

        if (params.waveform !== undefined) lfo.type = params.waveform as OscillatorType
        if (params.frequency !== undefined) lfo.frequency.value = params.frequency

        // Update gain based on both amplitude and modDepth
        if (params.amplitude !== undefined || params.modDepth !== undefined) {
          const currentParams = this.nodeParams.get(id) || {}
          const amplitude = params.amplitude !== undefined ? params.amplitude : currentParams.amplitude || 0.5
          const modDepth = params.modDepth !== undefined ? params.modDepth : currentParams.modDepth || 1.0
          const effectiveAmplitude = amplitude * modDepth
          lfoGain.gain.value = effectiveAmplitude

          if (this.debugMode)
            console.log(`LFO ${id} updated: amplitude=${amplitude}, modDepth=${modDepth}, effective=${effectiveAmplitude}`)

          // Update all modulation connections for this LFO
          this.updateModulationConnections(id)
        }
        break
      }

      case "midi": {
        // Handle MIDI parameter updates
        if (params.activeNotes !== undefined) {
          // No direct parameter updates needed, as notes are handled by noteOn/noteOff
        }
        break
      }

      case "output": {
        const output = nodeData.node as GainNode
        if (params.volume !== undefined) output.gain.value = params.volume
        break
      }
    }
  }

  // Handle MIDI note on event
  public noteOn(nodeId: string, note: number, velocity = 1.0) {
    this.initialize() // Ensure audio context is initialized
    this.start() // Ensure audio context is running

    if (!this.audioContext) return
    if (!this.midiNotes.has(nodeId)) return

    const noteMap = this.midiNotes.get(nodeId)
    // Check if this note is already playing
    if (noteMap?.has(note)) {
      // Note is already playing, just return
      return
    }

    const nodeData = this.nodes.get(nodeId)
    if (!nodeData) return

    const nodeParams = this.nodeParams.get(nodeId) || {}
    const waveform = nodeParams.waveform || "sine"
    const attack = nodeParams.attack || 0.05
    // const release = nodeParams.release || 0.1

    // Create oscillator for this note
    const osc = this.audioContext.createOscillator()
    osc.type = waveform as OscillatorType
    osc.frequency.value = this.midiNoteToFrequency(note)

    // Create envelope
    const envelope = this.audioContext.createGain()
    envelope.gain.value = 0

    // Connect oscillator to envelope
    osc.connect(envelope)

    // Connect envelope to the output node
    envelope.connect(nodeData.node)

    // Start the oscillator
    osc.start()

    // Apply attack
    envelope.gain.setValueAtTime(0, this.audioContext.currentTime)
    envelope.gain.linearRampToValueAtTime(velocity, this.audioContext.currentTime + attack)

    // Store the note data
    this.midiNotes.get(nodeId)?.set(note, {
      oscillator: osc,
      envelope: envelope,
      velocity: velocity,
    })

    if (this.debugMode) console.log(`Note on: ${nodeId}, note=${note}, freq=${osc.frequency.value}Hz`)
  }

  // Handle MIDI note off event
  public noteOff(nodeId: string, note: number) {
    if (!this.audioContext) return
    if (!this.midiNotes.has(nodeId)) return

    const noteData = this.midiNotes.get(nodeId)?.get(note)
    if (!noteData) return

    const nodeParams = this.nodeParams.get(nodeId) || {}
    const release = nodeParams.release || 0.1

    // Apply release
    noteData.envelope.gain.setValueAtTime(noteData.envelope.gain.value, this.audioContext.currentTime)
    noteData.envelope.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + release)

    // Schedule oscillator stop
    noteData.oscillator.stop(this.audioContext.currentTime + release + 0.01)

    // Remove the note after release
    setTimeout(
      () => {
        if (this.midiNotes.has(nodeId)) {
          this.midiNotes.get(nodeId)?.delete(note)
        }
      },
      (release + 0.02) * 1000,
    )

    if (this.debugMode) console.log(`Note off: ${nodeId}, note=${note}`)
  }

  // Convert MIDI note to frequency
  private midiNoteToFrequency(note: number): number {
    return 440 * 2 ** ((note - 69) / 12)
  }

  // Update all modulation connections for a given source node
  private updateModulationConnections(sourceId: string) {
    const connections = this.modulationConnections.get(sourceId) || []

    for (const connection of connections) {
      this.setupModulationConnection(sourceId, connection.targetId, connection.targetParam, connection.modulationAmount)
    }
  }

  // Connect nodes with proper handling for CV modulation
  public connectNodes(sourceId: string, targetId: string, sourceHandle = "output", targetHandle = "input") {
    this.initialize() // Ensure audio context is initialized
    this.start() // Ensure audio context is running

    if (!this.audioContext) return

    const sourceData = this.nodes.get(sourceId)
    const targetData = this.nodes.get(targetId)

    if (!sourceData || !targetData) {
      if (this.debugMode) console.error(`Connection failed: source or target not found`, { sourceId, targetId })
      return
    }

    // Store the connection
    const connectionId = `${sourceId}:${sourceHandle}->${targetId}:${targetHandle}`
    if (!this.connections.has(sourceId)) {
      this.connections.set(sourceId, new Set())
    }
    this.connections.get(sourceId)?.add(connectionId)

    if (this.debugMode) console.log(`Connecting: ${sourceId} -> ${targetId}, handles: ${sourceHandle} -> ${targetHandle}`)

    // Handle CV connections based on target handle
    if (targetHandle.endsWith("-cv")) {
      // This is a CV connection to a specific parameter
      const paramName = targetHandle.replace("-cv", "")

      // Get the appropriate parameter to modulate
      let targetParam: AudioParam | null = null

      switch (paramName) {
        case "freq":
          if (targetData.params.frequency) {
            targetParam = targetData.params.frequency
          }
          break
        case "detune":
          if (targetData.params.detune) {
            targetParam = targetData.params.detune
          }
          break
        case "q":
          if (targetData.params.Q) {
            targetParam = targetData.params.Q
          }
          break
        case "gain":
          if (targetData.params.gain) {
            targetParam = targetData.params.gain
          }
          break
        case "volume":
          if (targetData.params.volume) {
            targetParam = targetData.params.volume
          }
          break
        case "amp":
          if (targetData.params.amplitude) {
            targetParam = targetData.params.amplitude
          }
          break
      }

      if (targetParam) {
        // Determine appropriate modulation amount based on parameter type
        let modulationAmount = 100 // Default

        if (paramName === "freq" && this.nodeTypes.get(targetId) === "oscillator") {
          modulationAmount = 100 // For oscillator frequency (Hz)
        } else if (paramName === "freq" && this.nodeTypes.get(targetId) === "filter") {
          modulationAmount = 5000 // For filter frequency (Hz)
        } else if (paramName === "detune") {
          modulationAmount = 50 // For detune (cents)
        } else if (paramName === "q") {
          modulationAmount = 10 // For Q
        } else if (paramName === "gain" || paramName === "volume" || paramName === "amp") {
          modulationAmount = 0.5 // For gain/volume
        }

        // Store the modulation connection
        if (!this.modulationConnections.has(sourceId)) {
          this.modulationConnections.set(sourceId, [])
        }

        this.modulationConnections.get(sourceId).push({
          targetId,
          targetParam: paramName,
          modulationAmount,
        })

        // Set up the modulation connection
        this.setupModulationConnection(sourceId, targetId, paramName, modulationAmount)

        if (this.debugMode)
          console.log(`CV modulation connected: ${sourceId} -> ${targetId}:${paramName} with amount ${modulationAmount}`)
      } else {
        if (this.debugMode) console.error(`Target parameter not found for CV modulation`, { targetId, paramName })
      }
    } else {
      // Standard audio connection
      sourceData.node.connect(targetData.node)
      if (this.debugMode) console.log(`Standard audio connection made: ${sourceId} -> ${targetId}`)
    }
  }

  // Set up a modulation connection with the appropriate scaling
  private setupModulationConnection(sourceId: string, targetId: string, targetParam: string, modulationAmount: number) {
    const sourceData = this.nodes.get(sourceId)
    const targetData = this.nodes.get(targetId)

    if (!sourceData || !targetData) return

    // Get the target parameter
    let targetAudioParam: AudioParam | null = null

    switch (targetParam) {
      case "freq":
        targetAudioParam = targetData.params.frequency
        break
      case "detune":
        targetAudioParam = targetData.params.detune
        break
      case "q":
        targetAudioParam = targetData.params.Q
        break
      case "gain":
        targetAudioParam = targetData.params.gain
        break
      case "volume":
        targetAudioParam = targetData.params.volume
        break
      case "amp":
        targetAudioParam = targetData.params.amplitude
        break
    }

    if (!targetAudioParam) return

    // Create a gain node to scale the modulation
    const modulationScaler = this.audioContext!.createGain()

    // Get the source node's current parameters
    const sourceParams = this.nodeParams.get(sourceId) || {}

    // Calculate the effective modulation amount
    const effectiveModulation = modulationAmount * (sourceParams.modDepth || 1.0)
    modulationScaler.gain.value = effectiveModulation

    // Store the modulation scaler
    const scalerId = `${sourceId}->${targetId}:${targetParam}-mod`
    this.nodes.set(scalerId, {
      node: modulationScaler,
      type: "modScaler",
    })

    // Connect the source to the scaler and the scaler to the target parameter
    sourceData.node.connect(modulationScaler)
    modulationScaler.connect(targetAudioParam)

    if (this.debugMode)
      console.log(`Modulation connection setup: ${sourceId} -> ${targetId}:${targetParam} with amount ${effectiveModulation}`)
  }

  // Disconnect nodes with proper handling for CV modulation
  public disconnectNodes(sourceId: string, targetId: string, sourceHandle = "output", targetHandle = "input") {
    if (!this.audioContext) return

    const sourceData = this.nodes.get(sourceId)
    const targetData = this.nodes.get(targetId)

    if (!sourceData || !targetData) return

    // Remove the connection from our records
    const connectionId = `${sourceId}:${sourceHandle}->${targetId}:${targetHandle}`
    this.connections.get(sourceId)?.delete(connectionId)

    if (this.debugMode) console.log(`Disconnecting: ${sourceId} -> ${targetId}, handles: ${sourceHandle} -> ${targetHandle}`)

    // Handle CV disconnections based on target handle
    if (targetHandle.endsWith("-cv")) {
      // This is a CV disconnection from a specific parameter
      const paramName = targetHandle.replace("-cv", "")

      // Get the modulation scaler
      const scalerId = `${sourceId}->${targetId}:${paramName}-mod`
      const scalerData = this.nodes.get(scalerId)

      if (scalerData) {
        // Disconnect the source from the scaler
        sourceData.node.disconnect(scalerData.node)

        // Get the target parameter
        let targetParam: AudioParam | null = null

        switch (paramName) {
          case "freq":
            targetParam = targetData.params.frequency
            break
          case "detune":
            targetParam = targetData.params.detune
            break
          case "q":
            targetParam = targetData.params.Q
            break
          case "gain":
            targetParam = targetData.params.gain
            break
          case "volume":
            targetParam = targetData.params.volume
            break
          case "amp":
            targetParam = targetData.params.amplitude
            break
        }

        if (targetParam) {
          // Disconnect the scaler from the target parameter
          scalerData.node.disconnect(targetParam)
        }

        // Remove the scaler from our nodes
        this.nodes.delete(scalerId)

        // Remove from modulation connections
        if (this.modulationConnections.has(sourceId)) {
          const connections = this.modulationConnections.get(sourceId)
          const updatedConnections = connections.filter(
            (conn: any) => !(conn.targetId === targetId && conn.targetParam === paramName),
          )
          this.modulationConnections.set(sourceId, updatedConnections)
        }

        if (this.debugMode) console.log(`CV modulation disconnected: ${sourceId} -> ${targetId}:${paramName}`)
      }
    } else {
      // Standard audio disconnection
      sourceData.node.disconnect(targetData.node)
      if (this.debugMode) console.log(`Standard audio connection removed: ${sourceId} -> ${targetId}`)
    }
  }
}

export const audioEngine = new AudioEngine()
