import React, { Component } from 'react';
import axios from 'axios';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import MentorFeed from './MentorFeed';
import MentorFeedRight from './MentorFeedRight';
import AutoComplete from '../AutoComplete';

const styles = theme => ({
  root: {
    margin: '80px',
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing.unit * 2,
    textAlign: 'center',
    color: 'black',
  },
});

class MentorHome extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userId: this.props.userId,
      questions: [],
      mentorHome: true,
      quote: '',
    };
    this.onChange = this.onChange.bind(this);
    this.saveMentorQ = this.saveMentorQ.bind(this);
  }

  componentDidMount() {
    // get all questions
    axios.get('/seeInput', {
      params: {
        type: 'question',
        userId: this.state.userId,
      },
    }).then((res) => {
      this.setState({ questions: res.data.results });
    });
  }

  // contains the input value
  onChange(e) {
    this.setState({ quote: e.target.value });
  }

  // stores the input value and send to server
  saveMentorQ() {
    const storedQ = this.state.quote;
    this.setState({ quote: '' });
    axios.post('/addInput', {
      userId: this.state.userId,
      quote: storedQ,
    });
  }

  // renders left side of component
  renderMenteeQs() {
    return (
      <div>
        {this.state.questions.map(info => <MentorFeed info={info} />)}
      </div>
    );
  }

  // renders right side of component
  renderMenteeOnline() {
    return (
      <MentorFeedRight />
    );
  }

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <Grid container spacing={24}>
          <Grid item xs={8} style={{ height: 650, overflow: 'auto' }}>
            <Paper className={classes.paper}>
              <div className="input-descrip">
                Share with your mentees about what inspired you today?
                <br />
                <br />
                <textarea
                  className="input-value"
                  value={this.state.quote}
                  onChange={this.onChange}
                />
                <br />
                <button onClick={this.saveMentorQ}>
Submit
                </button>
                <br />
                <br />
                <br />
              </div>
              <div className="mentee-question-feed">
                Help guide your mentee's with tips that can help answer their worries/questions!
                <br />
                Simply visit their profile and chat with them!
                <br />
                {this.renderMenteeQs()}
              </div>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper className={classes.paper}>
              <div className="mentor-rating">
                Your Mentor Rating
                <div>
⭐️ ⭐ ️⭐️ ⭐️ ⭐️ 5 reviews
                </div>
              </div>
              <br />
              <br />
              <div className="mentor-connect-mentee">
                Current Mentees Online
                {' '}
                <br />
                <br />
                {this.renderMenteeOnline()}
              </div>
            </Paper>
            <Paper className={classes.paper}>
              <AutoComplete mentorHome={this.state.mentorHome} />
            </Paper>
          </Grid>
        </Grid>
      </div>
    );
  }
}


export default withStyles(styles)(MentorHome);
