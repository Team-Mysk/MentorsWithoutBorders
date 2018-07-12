import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';

import LanguageSelector from './LanguageSelector';
import VideoComponent from './VideoComponent';
import Chat from './Chat';

class VideoChatRoom extends Component {
  constructor(props) {
    super(props);
    this.state = {
      language: '',
      translate: '',
    };
    this.handleLanguageSelect = this.handleLanguageSelect.bind(this);
    this.socket = this.props.socket;
    this.socket.on('translate', (translate) => {
      console.log('translate recd: ', translate);
      this.setState({ translate });
    });
  }

  componentWillMount() {
    const { language, roomName, socket } = this.props;
    roomName && this.setState({ roomName, language });
  }

  handleLanguageSelect(language, translate) {
    const { socket, socketId } = this.props;
    console.log(socketId);
    this.setState({ language });
    const data = {
      socketId,
      translate,
    };
    this.socket.emit('translate', data);
  }

  render() {
    const {
      name, roomName, socket, socketId,
    } = this.props;
    const { language, translate } = this.state;
    return (

      <Grid className="video-chatroom" container justify="center">
        {language && roomName ? (
          <React.Fragment>
            <Grid
              item
              component={() => (
                <VideoComponent
                  name={name}
                  socket={socket}
                  language={language}
                  translate={translate}
                />
              )}
            />
            <Grid
              item
              xs={8}
              component={() => (
                <Chat
                  name={name}
                  language={language}
                  socket={socket}
                  translate={translate}
                />
              )}
            />
          </React.Fragment>
        ) : (
            <Grid
              item
              component={() => (
                <LanguageSelector
                  handleLanguageSelect={this.handleLanguageSelect}
                />
              )}
            />
          )}
      </Grid>
    );
  }
}

export default VideoChatRoom;
