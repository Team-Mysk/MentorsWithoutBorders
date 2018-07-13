import React, { Component } from 'react';
import axios from 'axios';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import { Redirect, Link } from 'react-router-dom';
import SearchBar from './SearchBar';
import MembersOnline from './MembersOnline';
import MenteeFeed from './MenteeFeed';


const styles = theme => ({
  root: {
    flexGrow: 1,
    margin: '80px',
  },
  flex: {
    flex: 1,
  },
  paper: {
    padding: theme.spacing.unit * 2,
    textAlign: 'center',
    color: theme.palette.text.secondary,
    fontFamily: 'sans-serif',
    overflow: 'auto',
  },
});

class MenteeHome extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userId: this.props.userId,
      quotes: [],
      isMentor: this.props.isMentor,
      question: '',
    };
    this.onChange = this.onChange.bind(this);
    this.saveMenteeQ = this.saveMenteeQ.bind(this);
  }

  componentDidMount() {
    axios.get('/seeInput', {
      params: {
        type: 'quote',
        userId: this.state.userId,
      }
    }).then((res) => {
      this.setState({ quotes: res.data });
    });
  }

  // contains the input value
  onChange(e) {
    this.setState({question: e.target.value});
  }

  // stores the input value and send to server
  saveMenteeQ() {
    let storedQ = this.state.question;
    console.log(storedQ);
    this.setState({ question: '' });
    axios.post('/addInput', {
      userId: this.state.userId,
      question: storedQ,
    });
  }

  checkTime() {
    const time = new Date().getHours();
    if (time < 12) {
      return 'Good Morning!';
    } if (time < 18) {
      return 'Good Afternoon!';
    }
    return 'Good Evening!';
  }

  renderMentorQs() {
    return (
      <div>
        {this.state.quotes.map(info => <MenteeFeed info={info} />)}
      </div>
    );
  }

  render() {
    const { classes, userId } = this.props;

    return (
      <div className={classes.root}>
        <div className="checkTime">
          {this.checkTime()}<br />
        </div>
        <Grid container spacing={24}>
          <Grid item xs={8} style={{ height:650, overflow: 'auto' }}>
            <Paper className={classes.paper}>
            <div className="input-descrip">
              Ask a question that mentors can help answer!<br /><br />
              <textarea 
              className="input-value" 
              value={this.state.question}
              onChange={this.onChange} /><br />
              <button onClick={this.saveMenteeQ}>Submit</button><br /><br /><br />
            </div>
            <div className="mentee-question-feed">
              Help guide your mentee's with tips that can help answer their worries/questions!
              <br />
                Simply visit their profile and chat with them!
              <br />
              {this.renderMentorQs()}
            </div>
            </Paper>
          </Grid>
            <Grid item xs={4} style={{ height: 500 }}>
              <Paper className={classes.paper}>
                <div>
                  {!this.state.isMentor ? (
                      <button className="signup-btn">
                        <Link to="/mentor-sign-up">
                          Become a Mentor!
                        </Link>
                      </button>
                    ) : <div />}<br /><br />
                  <SearchBar /><br /><br />
                  <MembersOnline userId={userId} socket={this.props.socket} />
                </div>
              </Paper>
            </Grid>
            <Grid
              item
              xs={8}
            >
              <Paper className={classes.paper}>
                <div
                  className="menteeOldQ"
                  style={{
                    color: 'black', lineHeight: 5, fontSize: 20,
                  }}
                >
                Here are the recent questions you've posted!
                </div>
                <br />
                <div className="mentor-quote-entry" style={{ lineHeight: 3 }}>
                  Why is my dog always hungryyy?
                  <br />
                  What would happen if I binge eat hot cheetos? 🤔🤔🤔
                </div>
              </Paper>
            </Grid>

          </Grid>
      </div>
    );
  }
}

export default withStyles(styles)(MenteeHome);