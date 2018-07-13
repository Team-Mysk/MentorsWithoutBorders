import React, { Component } from 'react';
import Avatar from 'material-ui/Avatar';
import { List, ListItem } from 'material-ui/List';
import CommunicationChatBubble from 'material-ui/svg-icons/communication/chat-bubble';
import AutoComplete from '../AutoComplete';

// import MobileTearSheet from '../../../MobileTearSheet';
class MembersOnline extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mentors: [],
      menteeHome: true,
    };
    this.socket = this.props.socket;
    this.sendChatRequest = this.sendChatRequest.bind(this);
  }

  componentDidMount() {
    console.log('mounting');
    const { userId } = this.props;
    this.socket.emit('getMyMentors', userId);
    this.socket.on('mentorsOnline', (mentors) => {
      this.setState({ mentors });
    });
    console.log(this.state.mentors);
  }

  sendChatRequest(toUserId, e) {
    e.preventDefault();
    const { userId } = this.props;
    const data = {
      userId,
      toUserId,
    };
    this.socket.emit('chatRequest', data);
    // this.socket.emit('getMyMentors', userId);
  }

  render() {
    const { mentors } = this.state;
    return (
      <div className="mentors-online">
        <div className="onlineContainer">
          <List style={{ maxWidth: '100%', overflow: 'auto', height: 300, overflowX: 'auto', overflowY: 'auto'}}>
            <span style={{
              fontFamily: 'sans-serif', fontWeight: 'bold', fontSize: '18px',
            }}
            >
              <center className='onlineMentors'>
                Mentors Online
              </center>
            </span>
            <br />
            <hr />
            {mentors.map(mentor => (
              <ListItem
                key={mentor.id}
                primaryText={mentor.fullName}
                rightAvatar={<Avatar src={mentor.photo} />}
                rightIcon={<CommunicationChatBubble />}
                onClick={e => this.sendChatRequest(mentor.id, e)}
              />
            ))}
          </List>
        </div>
        <div className="menteeCategories">
          <AutoComplete menteeHome={this.state.menteeHome} />
        </div>
      </div>
    );
  }
}

export default MembersOnline;
