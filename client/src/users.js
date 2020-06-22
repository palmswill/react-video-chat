import React, { useEffect, useState, useRef } from 'react';
import './App.css';
import io from "socket.io-client";
import Peer from "simple-peer";
import {PDFObject} from 'react-pdfobject';


const Users = () => {
  const [yourID, setYourID] = useState("");
  const [users, setUsers] = useState({});
  const [stream, setStream] = useState();
  const [file, setFile] = useState({
    content:null
  });
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);

  const userVideo = useRef();
  const partnerVideo = useRef();
  const socket = useRef();


  useEffect(() => {
    socket.current = io.connect("http://localhost:8080/");
    //navigator.mediaDevices.getDisplayMedia({ video: true, audio: true }).then(stream => {

    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
      setStream(stream);
      if (userVideo.current) {
        userVideo.current.srcObject = stream;

        //userVideo.current.srcObject = null;
      }
    })

    socket.current.on("yourID", (id) => {
      setYourID(id);
    })
    socket.current.on("allUsers", (users) => {
      setUsers(users);
    })

    socket.current.on("hey", (data) => {
      setReceivingCall(true);
      setCaller(data.from);
      setCallerSignal(data.signal);
    })
  }, []);

  function callPeer(id) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      config: {

        iceServers: [
          {
            urls: "stun:numb.viagenie.ca",
            username: "sultan1640@gmail.com",
            credential: "98376683"
          },
          {
            urls: "turn:numb.viagenie.ca",
            username: "sultan1640@gmail.com",
            credential: "98376683"
          }
        ]
      },
      stream: stream,
      file:file,
    });

    peer.on("signal", data => {
      socket.current.emit("callUser", { userToCall: id, signalData: data, from: yourID })
    })

    peer.on("stream", stream => {
      if (partnerVideo.current) {
        partnerVideo.current.srcObject = stream;
      }
    });
    socket.current.on("callAccepted", signal => {
      setCallAccepted(true);
      peer.signal(signal);
    })

  }

  function acceptCall() {
    setCallAccepted(true);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
      file:file,
    });
    peer.on("signal", data => {
      socket.current.emit("acceptCall", { signal: data, to: caller })
    })

    peer.on("stream", stream => {
      partnerVideo.current.srcObject = stream;
    });
    setReceivingCall(false);
    peer.signal(callerSignal);
  }

  let UserVideo;
  if (stream) {
    UserVideo = (
      <video playsInline muted ref={userVideo} autoPlay style={{ height: "100%", width: "100%", }} />
    );
  }

  let PartnerVideo;
  if (callAccepted) {
    PartnerVideo = (
      <video playsInline ref={partnerVideo} autoPlay style={{ height: "100%", width: "100%" }} />
    );
  }

  let incomingCall;
  if (receivingCall) {
    incomingCall = (
      <div style={{ width: "100%" }}>
        <h6>{caller} is calling you</h6>
        <button onClick={acceptCall} style={{ width: "80%" }}>Accept</button>
      </div>
    )
  }

  const onChangeHandler=(e)=>{
    setFile({
      content:URL.createObjectURL(e.target.files[0])
    })

  }


  let fileDisplay;
  if (!file.content){
    fileDisplay=(
    <input type="file" name="file" onChange={onChangeHandler}/>
    )}
  if (file.content){
    console.log(typeof(file.content))
    fileDisplay=(
      <PDFObject url={file.content} page="1" height="90vh" width="100%" />
    )

  }

  return (
    <div>
      <div className="row" style={{ height: "90vh", "marginBottom": "0" }}>
        <div className="col s2 red lighten-3" style={{ height: "100%" }}>
          <div className="row">
            {Object.keys(users).map(key => {
              if (key === yourID) {
                return null;
              }
              return (
                <button onClick={() => callPeer(key)} style={{ width: "80%" }}>Call {key}</button>
              );
            })}
          </div>
          <div className="row">
            {incomingCall}
          </div>
        </div>
        <div className="row col s2" style={{ "borderStyle": "solid", height: "90vh", padding: "0" }}>
          <div className="col s12" style={{ "borderStyle": "solid", height: "20vh", padding: "0" }}>
            {UserVideo}
          </div>
          <div className="col s12" style={{ "borderStyle": "solid", height: "70vh", padding: "0" }}>
          </div>
        </div>
        <div className="col s6" style={{ "borderStyle": "solid", height: "90vh" }}>
        {fileDisplay}
        </div>
        <div className="row col s2" style={{ "borderStyle": "solid", height: "90vh", padding: "0" }}>
          <div className="col s12" style={{ "borderStyle": "solid", height: "20vh", padding: "0" }}>
            {PartnerVideo}
          </div>
          <div className="col s12" style={{ "borderStyle": "solid", height: "70vh", padding: "0" }}>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Users;
