import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";

const styles = theme => ({
  root: {
    flexGrow: 1
  },
  paper: {
    padding: theme.spacing.unit * 2,
    textAlign: "center",
    color: theme.palette.text.secondary
  }
});

const MenteeHome = props => {
  const { classes } = props;

  return (
    <div>
    </div>
//     <div className={classes.root}>
//       <Grid container spacing={24}>
//         <Grid item xs={12}>
//           <Paper className={classes.paper}>xs=12</Paper>
//         </Grid>
//         <Grid item xs={6}>
//           <Paper className={classes.paper}>xs=6</Paper>
//           whats upppp
//           {/* <Chat messages={this.state.messages} socket={this.state.socket} /> */}
//         </Grid>
//         <Grid item xs={6}>
//           <Paper className={classes.paper}>xs=6</Paper>
//         </Grid>
//         <Grid item xs={3}>
//           <Paper className={classes.paper}>xs=3</Paper>
//         </Grid>
//         <Grid item xs={3}>
//           <Paper className={classes.paper}>xs=3</Paper>
//         </Grid>
//         <Grid item xs={3}>
//           <Paper className={classes.paper}>xs=3</Paper>
//         </Grid>
//         <Grid item xs={3}>
//           <Paper className={classes.paper}>xs=3</Paper>
//         </Grid>
//       </Grid>
//     </div>
  );
};

export default withStyles(styles)(MenteeHome);
