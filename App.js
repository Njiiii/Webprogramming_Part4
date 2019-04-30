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
    height: 60,
    paddingLeft: 3
  },
  
})





//Class for the main menu
//Main menu has two buttons, one for the noteslist and one that takes user to the screen where they can write a new note
class MainMenu extends React.Component{
    static navigationOptions = {
        title: "Welcome",
    };

    state = {
        error: false,
    }

    render() {
        const{navigate} = this.props.navigation

        if (this.state.error) {
            return (
                <View>
                    <Text>
                        Failed to load menus!
                    </Text>
                </View>
            )
        }

        //Between the buttons is an empty text so the buttons wouldn't touch eachother
        return (
            <View>
                <Button title="Notes" onPress={() => navigate('Notes', {name: 'Notes'})} />
                
                <Text></Text>
                
                <Button title="Add a new Note" onPress={() => navigate('Addnotescreen', {name: 'Addnotescreen'})} />
            </View>
        )
    }//render()
}//MainMenu





class AddNoteScreen extends React.Component {
   
  //Header
  static navigationOptions = {
      title: "Add a new note"
  }

  state = {
      loading: true,
      error: false,
      newNote: '',
      notes: []
  }


  //Notes are loaded in JSON form from JSON file
  //We have to fetch notes from the database and put them in to the notes[] array so the checks for duplicates and empty notes work
  componentDidMount = async () => {
    try {
      const response = await fetch("https://quiet-lowlands-76670.herokuapp.com/api/notes")
      const notes = await response.json()
      this.setState({loading: false, notes})

    } catch(e) {
      this.setState({loading: false, error: true})
    }
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


  //Alert that lets user know, that a new note has been successfully added to the database
  noteAddedAlert = () => {
    Alert.alert(
      //Warning header
      'Success',

      //Warning message
      'Note added successfully',
      [
        {
          text: 'OK',
          onPress: () => console.log('noteAddedAlert() OK pressed')
        }
      ]
    )
  }

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
      })//.then(response => response.json()).then(json => this.setState({notes: this.state.notes.concat(json)}))//fetch
      this.noteAddedAlert()
    
    }//else{}

  }//AddNote()


  render() {
    const {navigate} = this.props.navigation;

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
            Failed to connect to the database
          </Text>
        </View>
      )
    }

    //Again, there is an empty text between the components so they wouldn't touch
    return (
      <KeyboardAvoidingView style={styles.containerLayout} behavior="padding" enabled>

        <TextInput
          style={styles.input}
          onChangeText={(newNote) => this.setState({newNote})} 
          placeholder="Write note here"
          clearButtonMode='always'/>
        
        <Text></Text>
        
        <Button style={styles.buttonStyle} title="add note" onPress={this.addNote} />
      </KeyboardAvoidingView>
    )     
  
  }//render()
}//AddNoteScreen





//Class for the noteslist screen
class NotesList extends React.Component {

  //Header text
  static navigationOptions = {
    title: "Notes"
  }

  state = {
    loading: true,
    error: false,
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
      <ScrollView contentContainerStyle={styles.notesLayout}>
        {this.state.notes.map(this.listNotes)}
      </ScrollView>
    
    )    
  }//render()
} //NotesList





const AppNavigator = createStackNavigator(
  {
    Mainmenu: MainMenu,
    Notes: NotesList,
    Addnotescreen: AddNoteScreen
  },
  {
    initialRouteName: "Mainmenu"
  }
)

const AppContainer = createAppContainer(AppNavigator)

export default class App extends React.Component {
  render() {
    return <AppContainer />
  }
}
