import socketService from './socketService'

class WebRTCService {
    constructor() {
        this.peerConnection = null
        this.localStream = null
        this.remoteStream = null
        this.configuration = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
            ]
        }
        this.isInitiator = false
        this.callType = 'video' // 'video' or 'audio'
    }

    // Initialize WebRTC
    async initialize(callType = 'video') {
        this.callType = callType

        try {
            // Get user media
            const constraints = {
                video: callType === 'video' ? {
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                } : false,
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            }

            this.localStream = await navigator.mediaDevices.getUserMedia(constraints)
            return this.localStream
        } catch (error) {
            console.error('Error accessing media devices:', error)
            throw error
        }
    }

    // Create peer connection
    createPeerConnection(userId, chatId) {
        this.peerConnection = new RTCPeerConnection(this.configuration)

        // Add local stream tracks
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => {
                this.peerConnection.addTrack(track, this.localStream)
            })
        }

        // Handle ICE candidates
        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                socketService.socket.emit('webrtc:ice-candidate', {
                    to: userId,
                    chatId,
                    candidate: event.candidate
                })
            }
        }

        // Handle remote stream
        this.peerConnection.ontrack = (event) => {
            if (!this.remoteStream) {
                this.remoteStream = new MediaStream()
            }
            this.remoteStream.addTrack(event.track)
        }

        // Handle connection state
        this.peerConnection.onconnectionstatechange = () => {
            console.log('Connection state:', this.peerConnection.connectionState)
            if (this.peerConnection.connectionState === 'failed') {
                this.handleConnectionFailure()
            }
        }

        return this.peerConnection
    }

    // Start call (initiator)
    async startCall(userId, chatId, callType = 'video') {
        this.isInitiator = true
        await this.initialize(callType)
        this.createPeerConnection(userId, chatId)

        try {
            const offer = await this.peerConnection.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: callType === 'video'
            })

            await this.peerConnection.setLocalDescription(offer)

            // Send offer via socket
            socketService.socket.emit('webrtc:offer', {
                to: userId,
                chatId,
                offer,
                callType
            })

            return offer
        } catch (error) {
            console.error('Error creating offer:', error)
            throw error
        }
    }

    // Answer call (receiver)
    async answerCall(userId, chatId, offer, callType = 'video') {
        this.isInitiator = false
        await this.initialize(callType)
        this.createPeerConnection(userId, chatId)

        try {
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer))

            const answer = await this.peerConnection.createAnswer()
            await this.peerConnection.setLocalDescription(answer)

            // Send answer via socket
            socketService.socket.emit('webrtc:answer', {
                to: userId,
                chatId,
                answer
            })

            return answer
        } catch (error) {
            console.error('Error creating answer:', error)
            throw error
        }
    }

    // Handle received answer
    async handleAnswer(answer) {
        try {
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
        } catch (error) {
            console.error('Error setting remote description:', error)
        }
    }

    // Handle ICE candidate
    async handleIceCandidate(candidate) {
        try {
            await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
        } catch (error) {
            console.error('Error adding ICE candidate:', error)
        }
    }

    // Toggle video
    toggleVideo() {
        if (this.localStream) {
            const videoTrack = this.localStream.getVideoTracks()[0]
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled
                return videoTrack.enabled
            }
        }
        return false
    }

    // Toggle audio
    toggleAudio() {
        if (this.localStream) {
            const audioTrack = this.localStream.getAudioTracks()[0]
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled
                return audioTrack.enabled
            }
        }
        return false
    }

    // End call
    endCall() {
        // Stop all tracks
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop())
            this.localStream = null
        }

        if (this.remoteStream) {
            this.remoteStream.getTracks().forEach(track => track.stop())
            this.remoteStream = null
        }

        // Close peer connection
        if (this.peerConnection) {
            this.peerConnection.close()
            this.peerConnection = null
        }
    }

    // Handle connection failure
    handleConnectionFailure() {
        console.error('WebRTC connection failed')
        this.endCall()
    }

    // Get local stream
    getLocalStream() {
        return this.localStream
    }

    // Get remote stream
    getRemoteStream() {
        return this.remoteStream
    }

    // Check if call is active
    isCallActive() {
        return this.peerConnection !== null &&
            this.peerConnection.connectionState === 'connected'
    }
}

export const webRTCService = new WebRTCService()
export default webRTCService
