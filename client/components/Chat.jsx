import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Input from '@material-ui/core/Input';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';

import recognizeMic from 'watson-speech/speech-to-text/recognize-microphone';
import PropTypes from 'prop-types';
import VideoComponent from './VideoComponent';

const styles = theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },

  formControl: {
    margin: theme.spacing.unit,
  },
});

class Chat extends Component {
  constructor({ name, socket }) {
    super({ name, socket });
    this.state = {
      name: '',
      message: '',
      messages: [],
      msgHistory: '',
      language: '',
      translate: '',
      test: '',
    };
    this.translate = this.translate.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.onEnterPress = this.onEnterPress.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.onListenClick = this.onListenClick.bind(this);
    this.socket = socket;

    socket.on('results', (data) => {
      const results = JSON.parse(data);
      this.socket.emit('new message', {
        name,
        message: results.translations[0].translation,
        time: new Date(),
      });
    });

    socket.on('new message', (data) => {
      console.log('new message rec', data);
      this.setState(previousState => ({
        messages: [...previousState.messages, data],
      }));
    });
  }

  componentWillMount() {
    const { name, language, translate } = this.props;
    this.setState({ name, language, translate });
    this.socket.emit('userJoin', { name });
  }

  componentDidMount() {
    this.socket.on('msghistory', (msgHistory) => {
      this.setState({ msgHistory });
    });
  }

  onListenClick() {
    const { language } = this.props;
    fetch('/api/speech-to-text/token')
      .then(response => response.text())
      .then((token) => {
        const stream = recognizeMic({
          token,
          model: language,
          objectMode: true,
          extractResults: true,
          format: false,
        });
        stream.on('data', (data) => {
          console.log(data);
          this.setState({
            test: data.alternatives[0].transcript,
          });
        });
        stream.on('error', (err) => {
          console.log(err);
        });
        document.querySelector('.stop').onclick = stream.stop.bind(stream);
      }).catch((error) => {
        console.log(error);
      });
  }

  onEnterPress(e) {
    if (e.keyCode == 13 && e.shiftKey == false) {
      e.preventDefault();
      this.sendMessage(e);
    }
  }

  handleChange(e) {
    this.setState({
      message: e.target.value,
    });
  }

  sendMessage(e) {
    e.preventDefault();
    const { name, message } = this.state;
    const newMessage = { name, message };

    // this.socket.emit('new message', newMessage);
    this.setState({ message: '' });
  }

  translate() {
    const { test, language, translate } = this.state;

    console.log('====', test, language, translate);
    this.socket.emit('translationJob', test, language, translate);
  }

  render() {
    const { classes } = this.props;
    const { test, messages, message } = this.state;
    return (
      <React.Fragment>
        {/* <div>
        <div className={classes.container}> */}
        <Grid container justify="center" spacing={8}>
          <Grid item xs={8}>
            {/* <Paper className={classes.paper}> */}
            <div className="messagesArea">
              {messages.map(line => (
                <div key={line.time} className="aMessage">
                  {`${line.name}: ${line.message}`}
                </div>
              ))}
            </div>
          </Grid>
          <Grid item xs={8}>
            <FormControl fullWidth className={classes.formControl} onSubmit={this.sendMessage}>
              {/* <div className="enterMessage"> */}
              <Input className="typeMessage" onKeyDown={this.onEnterPress} value={message} onChange={this.handleChange} />
              {/* <input type="submit" value="Submit" /> */}
              {/* </div> */}
            </FormControl>
            {/* </Paper> */}
          </Grid>
        </Grid>
        <div>
          <button type="button" onClick={() => this.onListenClick()}>
            Listen
          </button>
          <button type="button" className="stop" onClick={() => this.translate()}>
            Stop
          </button>
        </div>
        {test}
      </React.Fragment>
    );
  }
}

Chat.propTypes = {
  name: PropTypes.string,
};

export default withStyles(styles)(Chat);
