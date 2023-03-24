import logo from './logo.svg';
import './App.css';
import {useEffect, useState} from 'react'
import axios from 'axios'
import SpeechRecognition, {useSpeechRecognition} from 'react-speech-recognition';
import io from 'socket.io-client'

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState([])
  const {
    transcript,
    resetTranscript,
    browserSupportsSpeechRecognition, 
  } = useSpeechRecognition();

  const socket = io('http://localhost:4000');

  useEffect(() => {
    socket.on('response', (msg) => {
      setResponse(msg);
    });
  }, []);

  if (!browserSupportsSpeechRecognition) {
    return (
      <div>
          no... just get off whatever browser you are on it doesnt have support for literally anything
        </div>
      )
  }

  // previous length
  let previousLength
  let elapsedTranscriptionTime = 0

  function handleMessage(){
    SpeechRecognition.startListening({language: "en-US", continuous: true});

    SpeechRecognition.onerror = () => {
      console.error('SpeechRecognition error')
    }

    const checkTranscriptionInterval = setInterval(() => {
      // Stop recognition if there is no new content for 5 seconds or if 20 seconds have elapsed
      if (transcript.length ===  previousLength || elapsedTranscriptionTime >= 20000) {
        clearInterval(checkTranscriptionInterval)
        SpeechRecognition.stopListening();

        // Emit the transcript to the socket.io server
        socket.emit('transcript', { transcript });
      }

      // Update the previous length of the transcription
      previousLength = transcript.length
      elapsedTranscriptionTime += 5000
    }, 5000)
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <div>
          <p> 
            <button onClick = {() => handleMessage()}>over yonder</button>
          </p>
          <p>
            {transcript}
          </p>
          <p>
            {transcript.length}
          </p> 
          <p>{response}</p>
        </div>
      </header>
    </div>
  );
}

export default App;
