import React, { Component } from 'react';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import SignIn from './components/SignIn/SignIn';
import Register from './components/Register/Register';
import Rank from './components/Rank/Rank';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Particles from 'react-particles-js';
import './App.css';


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

const initialState = {
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

class App extends Component {
  constructor(){
    super();
    this.state = initialState
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
  const image = document.getElementById('inputimage');
  const width = Number(image.width);
  const height = Number(image.height);

  return{
    leftCol: clarifaiFace.left_col * width,
    rightCol: width - (clarifaiFace.right_col * width),
    topRow: clarifaiFace.top_row * height,
    bottomRow: height - (clarifaiFace.bottom_row * height)

  }}

  displayFaceBox = (box) =>{
    this.setState({box: box});
  }

  onInputChange = (event) =>{
    this.setState({input: event.target.value});
  }

  onRouteChange = (route) =>{
    if (route === 'signout'){
      this.setState(initialState);
    } else if (route==='home'){
      this.setState({isSignedIn: true});
    }
    this.setState({route: route});
  }

//FACE_DETECT_MODEL
  onButtonSubmit = (event) =>{
    this.setState({imageUrl: this.state.input});
     fetch('http://localhost:4000/imageurl', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          input: this.state.input
        })
     })
     .then( response => response.json())
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
      ).catch(response => console.log)
    }
    this.displayFaceBox(this.calculateFaceLocation(response))
    })
  .catch(err => console.log(err))
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
