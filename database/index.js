const pg = require('pg');

pg.defaults.ssl = true;
const Sequelize = require('sequelize');

const { Op } = Sequelize;
const sequelize = new Sequelize(process.env.POSTGRES_URI, { logging: false });

sequelize
  .authenticate()
  .then(() => {
    console.log('🔥 🔥 Database Connected🔥 🔥');
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });

// model represents a table in database
const User = sequelize.define('user', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  googleId: Sequelize.STRING,
  fullName: Sequelize.STRING,
  photo: Sequelize.STRING,
  gender: Sequelize.STRING,
  age: Sequelize.INTEGER,
  ratings: Sequelize.INTEGER,
  aQuote: Sequelize.STRING,
  totalRatings: Sequelize.INTEGER,
  bio: Sequelize.STRING,
  isMentor: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
  mentors: Sequelize.ARRAY(Sequelize.TEXT),
  mentees: Sequelize.ARRAY(Sequelize.TEXT),
  personality: Sequelize.ARRAY(Sequelize.TEXT),
  blocked: Sequelize.ARRAY(Sequelize.TEXT),
  location: Sequelize.JSON,
  locale: Sequelize.STRING,
  socket: Sequelize.STRING,
  wordCount: Sequelize.JSON,
  birthdate: Sequelize.DATEONLY,
  avgLoggedInTime: Sequelize.INTEGER,
  onlineNow: Sequelize.BOOLEAN,
}, { timestamps: false });

// category table is not being used atm (will need to have some fields already saved in it automatically, this is not meant for users to submit a field profession (only for our use))
const Category = sequelize.define('category', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  category: Sequelize.STRING,
}, { timestamps: false });
// can also write getterMethods and setterMethods, useful?(http://docs.sequelizejs.com/manual/tutorial/models-definition.html#getters-setters)
// future plans: import all model definitions from another file

const Message = sequelize.define('message', {
  message: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  date: Sequelize.DATE,
}, { timestamps: true, updatedAt: false });

const Room = sequelize.define('room', {
  name: {
    type: Sequelize.INTEGER,
    allowNull: false,
    unique: true,
  },
}, { timestamps: true, updatedAt: false });

const Request = sequelize.define('request', {
  roomName: {
    type: Sequelize.INTEGER,
    allowNull: false,
    unique: true,
  },
  from: {
    type: Sequelize.INTEGER,
    allowNull: false,
    unique: true,
  },
}, { timestamps: true, updatedAt: false });


const MyMentor = sequelize.define('myMentor', {}, { timestamps: false });
const RoomMembers = sequelize.define('roomMembers', {}, { timestamps: false });
const UserCategory = sequelize.define('userCategories', {}, { timestamps: false });
const MentorCategory = sequelize.define('mentorCategories', {}, { timestamps: false });

Request.belongsTo(User);
Room.hasMany(Message);
Message.belongsTo(User);
User.belongsToMany(User, { as: 'mentor', through: 'myMentor' });
Room.belongsToMany(User, { through: RoomMembers });
User.belongsToMany(Room, { through: RoomMembers });

// Connect the categories to User
User.belongsToMany(Category, { through: UserCategory });
User.belongsToMany(Category, { through: MentorCategory });
Category.belongsToMany(User, { through: UserCategory });
Category.belongsToMany(User, { through: MentorCategory });

const Quote = sequelize.define('quote', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  quote: Sequelize.STRING,
}, { timestamps: false });

Quote.belongsTo(User); // shared foreign key w userId

const Question = sequelize.define('question', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  question: Sequelize.STRING,
}, { timestamps: false });

Question.belongsTo(User); // shared foreign key w userId

// sync model to database
User.sync({ force: false }).then(() => { // set true if overwite existing database
  // Table created
  console.log('User is synced');
}).catch((err) => {
  console.log('User is not synced');
});

Category.sync({ force: false }).catch((err) => { throw err; });
UserCategory.sync({ force: false }).catch((err) => { throw err; });
MentorCategory.sync({ force: false }).catch((err) => { throw err; });

const tableSync = [Message, Room, MyMentor, RoomMembers, Request];
tableSync.forEach((table) => {
  table.sync({ force: false }).catch((err) => {
    console.log(`> > > ${table.name} SYNC ERROR < < <`, err);
  });
});

// confirm if user exists in database
const findUser = (googleId, callback) => {
  User.findOne({
    where: { googleId },
  }).then((user) => {
    // console.log('user', user);
    callback(user);
  }).catch((err) => {
    console.log(err, 'ERROR');
  });
};

const findUserById = (userId, callback) => {
  if (userId) {
    User.findById(userId)
      .then((user) => {
        callback(user);
      })
      .catch((err) => {
        console.log('This is userId', userId);
        console.log('Error finding user by id', err);
      });
  }
};

// saves user to database
const saveUser = (query) => {
  User.create(query).then((user) => {
    console.log(query.fullName, 'is saved to db');
  }).catch((err) => {
    console.log('not saved to database');
  });
};

async function asyncSaveUser(query) {
  const saved = await User.create(query);

  return new Promise((resolve) => {
    resolve('Saved');
  });
}

// get location information from users
const allLocation = (callback) => {
  User.findAll({ attributes: ['location'] })
    .then((userData) => {
      const locations = userData.map(user => user.dataValues.location).filter(user => user !== null);
      callback(locations);
    }).catch((err) => {
      console.log('incorrectly finding data');
    });
};

const getMyMentors = (userId, cb) => {
  MyMentor.findAll({ where: { userId } })
    .then((data) => {
      const users = data.map(({ dataValues: { mentorId: id } }) => id);
      User.findAll({
        where: {
          id: {
            [Op.or]: users,
          },
        },
      }).then(mentors => cb(mentors));
    });
};

const getAllMentors = (callback) => {
  User.findAll({
    where: {
      isMentor: true,
    },
  }).then((data) => {
    callback(data);
  });
};

const getCurrentUserCategories = (userId, callback) => {
  UserCategory.findAll({
    where: { userId },
  }).then((data) => {
    callback(data);
  })
    .catch((err) => {
      console.log('Error in getting categories', err);
    });
};

async function getCurrentMentorCategories(userId) {
  const found = await MentorCategory.findAll({
    where: { userId },
  });

  return new Promise((resolve) => {
    resolve(found);
  });
}

const setMyMentor = (userId, mentorId) => {
  MyMentor.create({ userId, mentorId });
};

const savePersonality = (userId, personality) => {
  User.findById(userId)
    .then((user) => {
      user.update({ personality });
    });
};

const setMessage = (userId, message, roomId) => {
  Message.create({ userId, message, roomId });
};

const loginUser = (userId, socket) => {
  User.findById(userId)
    .then((user) => {
      user.update({ socket });
    });
};

const logoutUser = (userId) => {
  User.findById(userId)
    .then((user) => {
      user.update({ socket: null });
    });
};

const setAvgLoggedInTime = (userId, login, logout) => {
  User.findById(userId)
    .then((user) => {
      const prevAvgLoggedInTime = user.avgLoggedInTime;
      const currentAvgLoggedInTime = ((login + logout) / 2);
      const avgLoggedInTime = ((prevAvgLoggedInTime + currentAvgLoggedInTime) / 2);
      console.log('This is avg loggedInTime', avgLoggedInTime);

      user.update({ avgLoggedInTime });
      console.log('It got updated');
    });
};

const updateUserWordCount = (userId, wordCount, callback) => {
  User.findById(userId)
    .then((user) => {
      user.update({ wordCount });
    })
    .then(() => {
      callback();
    })
    .catch((err) => {
      console.log('Error in updating userWordCount', err);
    });
};

const updateUserCategories = (userId, categoryId) => {
  UserCategory.findOrCreate({ where: { userId, categoryId } });
};

const deleteUserCategories = (userId, categoryId) => {
  UserCategory.destroy({ where: { userId, categoryId } });
};

const updateMentorCategories = (userId, categoryId) => {
  MentorCategory.findOrCreate({ where: { userId, categoryId } });
};

const deleteMentorCategories = (userId, categoryId) => {
  MentorCategory.destroy({ where: { userId, categoryId } });
};

// sets the user to become a mentor
const mentorStatus = (userId) => {
  User.findById(userId).then((user) => {
    user.update({ isMentor: true });
  });
};

const setRoom = (userId, mentorId) => {
  const roomName = Number(userId.toString() + mentorId.toString());

  Room.create({ name: roomName })
    .then(room => room.addUsers([userId, mentorId]))
    .catch(err => console.log(err));
};

const getRoomMessages = (roomId) => {
  Message.findAll({ where: { roomId } });
};

const getSocketId = (userId, cb) => {
  User.findById(userId)
    .then((user) => {
      cb(user.dataValues);
    });
};

const setRequest = (userId, roomName, from, cb) => {
  Request.create({ userId, roomName, from })
    .then((request) => {
      cb();
    });
};

const getRequests = (userId, cb) => {
  Request.findAll({ where: { userId } })
    .then((requests) => {
      cb(requests);
    });
};

Quote.sync({ force: false }).then(() => { // set true if overwite existing database
  // Table created
  console.log('Quote is synced');
}).catch((err) => {
  console.log('Quote is not synced');
});

const saveQuote = (query) => {
  Quote.create(query).then((quote) => {
    console.log('quote is saved to db');
  }).catch((err) => {
    console.log('not saved to db');
  });
};

Question.sync({ force: false }).then(() => { // set true if overwite existing database
  // Table created
  console.log('Question is synced');
}).catch((err) => {
  console.log('Question is not synced');
});

const saveQuestion = (query) => {
  Question.create(query).then((question) => {
    console.log('question is saved to db');
  }).catch((err) => {
    console.log('not saved to db');
  });
};

const allQuestions = (userId, callback) => {
  Question.findAll({
    where: {
      userId: {
        [Op.notIn]: [userId],
      },
    },
    include: [
      { model: User },
    ],
  }).then((questions) => {
    console.log('These are the questions', questions)
    // console.log(questions[0].dataValues.user.dataValues);
    const userQs = questions.map((info) => {
      const userInfo = info.dataValues.user.dataValues;
      return {
        question: info.dataValues.question,
        fullName: userInfo.fullName,
        photo: userInfo.photo,
      };
    });
    callback(userQs);
  });
};

const allQuotes = (userId, callback) => {
  Quote.findAll({
    where: {
      userId: {
        [Op.notIn]: [userId],
      },
    },
    include: [
      { model: User },
    ],
  }).then((quotes) => {
    // console.log(quotes[0].dataValues.user.dataValues);
    const userQs = quotes.map((info) => {
      const userInfo = info.dataValues.user.dataValues;
      return {
        quote: info.dataValues.quote,
        fullName: userInfo.fullName,
        photo: userInfo.photo,
      };
    });
    callback(userQs);
  });
};


// const addRandomMessages = (qty = 25) => {
//   const coolKids = ['Matt', 'Yona', 'Selena', 'Kav'];
//   const getRandomArbitrary = (min, max) => Math.random() * (max - min) + min;

//   for (let i = 0; i < qty; i++) {
//     coolKids.forEach((awesomeDood) => {
//       axios.get(`http://api.icndb.com/jokes/random?escape=javascript&firstName=${awesomeDood}&lastName=`)
//         .then(({ data }) => {
//           Message.create({
//             userId: getRandomArbitrary(315, 319),
//             date: new Date(),
//             message: data.value.joke,
//             roomId: getRandomArbitrary(1, 5),
//           });
//         });
//     });
//   }
// };
// // addRandomMessages()

module.exports = {
  findUser,
  findUserById,
  saveUser,
  asyncSaveUser,
  allLocation,
  getMyMentors,
  getAllMentors,
  setMyMentor,
  setMessage,
  loginUser,
  logoutUser,
  setRoom,
  getRoomMessages,
  getSocketId,
  setAvgLoggedInTime,
  updateUserWordCount,
  getCurrentUserCategories,
  getCurrentMentorCategories,
  deleteUserCategories,
  updateUserCategories,
  updateMentorCategories,
  deleteMentorCategories,
  mentorStatus,
  saveQuote,
  saveQuestion,
  savePersonality,
  allQuestions,
  allQuotes,
  setRequest,
  getRequests,
};
