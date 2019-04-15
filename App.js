import * as React from 'react';
import { Text, View, KeyboardAvoidingView, StyleSheet, Button, ScrollView, ActivityIndicator, TextInput, Alert} from 'react-native';
import { createStackNavigator, createAppContainer } from 'react-navigation';

//Stylesheet for the program
const styles = StyleSheet.create({
  containerLayout: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  notesLayout: {
    paddingVertical: 10,
    paddingLeft: 5,
  },
  input: {
    backgroundColor: 'white',
    borderColor: 'black',
    borderWidth: 1,
    width: '100%',
    height: 40,
  },
})

//Class for the notes screen
class NotesList extends React.Component {

  //Header text
  static navigationOptions = {
    title: "Notes"
  }

  state = {
    loading: true,
    error: false,
    newNote: '',
    notes: []
  }


  //Notes are loaded in JSON form from JSON file
  componentDidMount = async () => {
    try {
      const response = await fetch("https://quiet-lowlands-76670.herokuapp.com/api/notes")
      const notes = await response.json()
      this.setState({loading: false, notes})

    } catch(e) {
      this.setState({loading: false, error: true})
    }
  }


  listNotes = ({id, content}) => {
    return (
      <Text key={id}>{content}</Text>
    )
  }


  //Alert for duplicate note
  duplicateAlert = () => {
    Alert.alert(
      //Warning header
      'Warning',

      //Warning message
      'Duplicate notes are not allowed',
      [
        {
          text: 'OK',
          onPress: () => console.log('duplicateAlert() OK pressed')
        }
      ]
    )
  }//duplicateAlert()

  //Alert for empty note
  emptyAlert = () => {
    Alert.alert(
      //Warning header
      'Warning',

      //Warning message
      'Empty notes are not allowed',
      [
        {
          text: 'OK',
          onPress: () => console.log('emptyAlert() OK pressed')
        }
      ]
    )
  }//emptyAlert()


  //To add note into the database, we need to make a POST request to the server
  addNote = async () => {
    const note = {
      content: this.state.newNote
    }

    //If user tries to enter duplicate note, show duplicateAlert()
    if(this.state.notes.map(note => note.content.toUpperCase()).includes(note.content.toUpperCase())) {
      this.duplicateAlert()
      return 
    } 
    
    //If user tries to enter empty note, show emptyAlert()
    if(note.content == "") {
      this.emptyAlert()
      return
    
    } else {
      fetch('https://quiet-lowlands-76670.herokuapp.com/api/notes', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: this.state.newNote,
          date: ""
        })

      //After making the request, we need to update the notes array, so we can show the new note
      }).then(response => response.json()).then(json => this.setState({notes: this.state.notes.concat(json)}))//fetch

    }
  }//addNote


  render() {
    const {navigate} = this.props.navigation

    //While loading JSON file, show animated loading indicator
    if (this.state.loading) {
      return (
        <View>
          <ActivityIndicator animating={true} />
        </View>
      )
    }

    //If notes could not be loaded, show error text
    if (this.state.error) {
      return (
        <View>
          <Text>
            Failed to load notes list
          </Text>
        </View>
      )
    }

    //Notes are shown in their own scrollview
    return (
      <KeyboardAvoidingView style={styles.containerLayout} behavior="padding" enabled>

        <ScrollView contentContainerStyle={styles.notesLayout}>
          {this.state.notes.map(this.listNotes)}
        </ScrollView>

        
        <TextInput
          style={styles.input}
          onChangeText={(newNote) => this.setState({newNote})} 
          placeholder="Write note here"
          clearButtonMode='always'/>

        <Button title="add note" onPress={this.addNote} />
      </KeyboardAvoidingView>
    )    
  }//render()
} //NotesList


const AppNavigator = createStackNavigator(
  {
    Notes: NotesList
  },
  {
    initialRouteName: "Notes"
  }
)

const AppContainer = createAppContainer(AppNavigator)

export default class App extends React.Component {
  render() {
    return <AppContainer />
  }
}
