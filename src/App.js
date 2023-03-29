import logo from './logo.svg';
import './App.css';
import {useEffect, useState} from 'react'
import SpeechRecognition, {useSpeechRecognition} from 'react-speech-recognition';
import io from 'socket.io-client'

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([])
  const [language, setLanguage] = useState()
  const [messageText, setMessageText] = useState('')
  const {
    transcript,
    resetTranscript,
    browserSupportsSpeechRecognition, 
  } = useSpeechRecognition();

  if (!browserSupportsSpeechRecognition) {
    return (
      <div>
          no... just get off whatever browser you are on it doesnt have support for literally anything
        </div>
      )
  }
  const socket = io('http://localhost:4000');

  

  // previous length
  let previousLength
  let elapsedTranscriptionTime = 0

  function handleMessageSpeech(){
    
    SpeechRecognition.startListening({language: language, continuous: true});

    // SpeechRecognition.onerror = () => {
    //   console.error('SpeechRecognition error')
    // }
    
    console.log(transcript)
    let checkTranscriptTimer = setInterval(() => {
      console.log(transcript)
      // Stop recognition if there is no new content for 5 seconds or if 20 seconds have elapsed
      if (transcript.length ===  previousLength || elapsedTranscriptionTime >= 20000) {
        // debugger
        console.log(transcript)
        SpeechRecognition.stopListening()
        let emission = transcript
        console.log(emission)
        // Emit the transcript to the socket.io server
        socket.emit('chat message', emission );
        socketHandler()
        clearInterval(checkTranscriptTimer)
      }

      // Update the previous length of the transcription
      previousLength = transcript.length
      elapsedTranscriptionTime += 5000
    }, 5000)
  }

  function handleMessageText() {
    setIsLoading(true)
    console.log(messageText)
    console.log(messages)
   
    socket.emit('chat message', messageText);
    // setMessageText('');
    socketHandler()
  }
  function socketHandler(){

    socket.on('chat response', (response) => {
      let ternaryCheck = messageText ? messageText : transcript
      console.log(response)
      setMessages([...messages, ternaryCheck, response]);
      messageText ? setMessageText(''): resetTranscript()
      setIsLoading(false);
      
    });
    
  }
  
    
  
function handleTextSubmit(e){
  e.preventDefault()
  if (isLoading === false){
    handleMessageText()
  }
}
function handleSpeechSubmit(){
  if (isLoading === false){
    handleMessageSpeech()
  }
  
}

  return (
    <div className="App">
        <div>
        <label htmlFor="language-select">Select a language:</label>
        <select value = {language} onChange = {(e) => setLanguage(e.target.value)}>
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
          <option value="it">Italian</option>
          <option value="ja">Japanese</option>
          <option value="ko">Korean</option>
          <option value="pt">Portuguese</option>
          <option value="ru">Russian</option>
          <option value="zh">Chinese</option>
        </select>
        <img src={logo} className="App-logo" alt="logo" />
<p>
          <button onClick = {handleSpeechSubmit}>over yonder</button>
</p>
<div>
  {/* will most likely emit each letter 
      push all of them into a array join them
      then set Messages to include it


      will also include translation button to
      reread content
  */}
{/* if the last key is a odd number in the array */}
          {messages && messages.map((message, i) => {
        
              return (
                <p key = {i}>
            {message}
          </p>)
            
          
          })}
          </div>
          <p>
            {transcript}
          </p>
          <p>
            {transcript.length}
          </p>
          <form onSubmit={(e) => handleTextSubmit(e)}>
  <input type="text" placeholder='input text here' value={messageText} onChange={(e) => setMessageText(e.target.value)} />
  <button type="submit">Submit</button>
</form>
        </div>
    </div>
  );
}

export default App;
