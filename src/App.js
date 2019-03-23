import React, { Component } from 'react';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import SignIn from './components/SignIn/SignIn';
import Register from './components/Register/Register';
import Rank from './components/Rank/Rank';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Particles from 'react-particles-js';
import Clarifai from 'clarifai';
import './App.css';

const app = new Clarifai.App({
    apiKey:'11b5eca6295e4c8c93dba97817b27e5e'
});

const particlesOptions = {
                  particles: {
                    number:{
                      value:60,
                      density:{
                        enable: true,
                        value_area: 790
                      }
                    }
                  }                
}

class App extends Component {
  constructor(){
    super();
    this.state = {
      input:'',
      imageUrl:'',
      box:{},
      route:'signin',
      isSignedIn: false,
      user: {
        email: '',
        id: '',
        entries: 0,
        name: '',
        joined: ''
      }
          }
  }

  loadUser = (data) => {
    this.setState({
      user:{
        email: data.email,
        id: data.id,
        entries: data.entries,
        name: data.name,
        joined: data.joined

      }
    })
  }



calculateFaceLocation = (resp) =>{
  const clarifaiFace = resp.outputs[0].data.regions[0].region_info.bounding_box;
  const image = document.getElementById('inputImage');
  const width = Number(image.width);
  const height = Number(image.height);
  return{
    leftCol: clarifaiFace.left_col * width,
    rightCol: width - (clarifaiFace.right_col * width),
    topRow: clarifaiFace.top_row * height,
    bottomRow: height - (clarifaiFace.bottom_row * height)

  }}

  displayFaceBox = (box) =>{
    console.log(box);
    this.setState({box: box});
  }

  onInputChange = (event) =>{
    console.log(event.target.value);
    this.setState({input: event.target.value});
  }

  onRouteChange = (route) =>{
    if (route === 'signout'){
      this.setState({isSignedIn: false});
    } else if (route==='home'){
      this.setState({isSignedIn: true});
    }
    this.setState({route: route});
  }

//FACE_DETECT_MODEL
  onButtonSubmit = (event) =>{
    this.setState({imageUrl: this.state.input});
  app.models.predict(Clarifai.FACE_DETECT_MODEL, 
  this.state.input)
  .then((response)=>{
    if (response){
      fetch('http://localhost:4000/image', {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          id: this.state.user.id
        })
    })
      .then(res => res.json())
      .then(count =>
        this.setState(Object.assign(this.state.user, {entries: count}))
      )
    }
    this.displayFaceBox(this.calculateFaceLocation(response))
    })
  .catch(err => console.log(err))
      // there was an error
          }

  render() {
   const { isSignedIn, box, route, imageUrl } = this.state;
    return (
      <div className="App">
        <Particles className='particles' params={particlesOptions}/>
        <Navigation onRouteChange={this.onRouteChange} 
        isSignedIn={isSignedIn}/>
        { route === 'home' ?
            <div>
              <Logo/>
              <Rank name={this.state.user.name} entries={this.state.user.entries}/>
              <ImageLinkForm onInputChange={this.onInputChange} onButtonSubmit={this.onButtonSubmit}/>
              <FaceRecognition box={box} imageUrl={imageUrl}/>       
            </div> 
           :( route === 'signin' ?
           <SignIn onRouteChange={this.onRouteChange} loadUser={this.loadUser}/>
            :
           <Register onRouteChange={this.onRouteChange} loadUser={this.loadUser}/>
            )
      }
      </div>
    );
  }

}

export default App;