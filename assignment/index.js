const express = require("express");
const bodyParser = require("body-parser");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
const port = 3000;


app.use(bodyParser.json());


const uri = "mongodb://localhost:27017"; 
const dbName = "assignment";
let db;

MongoClient.connect(uri, { useUnifiedTopology: true })
  .then((client) => {
    console.log("Connected to MongoDB");
    db = client.db(dbName);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });


app.get("/users", async (req, res) => {
  try {
    const users = await db.collection("users").find({}).toArray();
    res.json(users);
  } catch (err) {
    res.status(500).send(err.message);
  }
});


// app.get("/users/:userId", async (req, res) => {
//   try {
//     const user = await db.collection("users").findOne({ userId:new ObjectId( req.params.userId) });
//     if (!user) return res.status(404).send("User not found");
//     res.json(user);
//   } catch (err) {
//     res.status(500).send(err.message);
//   }
// });


app.get("/users/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
  
      
      const objectId = ObjectId.isValid(userId) ? new ObjectId(userId) : null;
  
      if (!objectId) {
        return res.status(400).send("Invalid user ID format");
      }
  
      const user = await db.collection("users").findOne({ _id: objectId });
  
      if (!user) return res.status(404).send("User not found");
  
      res.json(user);
    } catch (err) {
      res.status(500).send(err.message);
    }
  });
  


// app.post("/users", async (req, res) => {
//   try {
//     const newUser = req.body;
//     await db.collection("users").insertOne(newUser);
//     res.status(201).send("User created");
//   } catch (err) {
//     res.status(500).send(err.message);
//   }
// });


app.post("/users", async (req, res) => {
    try {
      const { userId, name, email, channelName, subscribers, joinedDate } = req.body;
  
      
      const newUser = {
        userId,
        name,
        email,
        channelName,
        subscribers,
        joinedDate: new Date() 
      };
  
      await db.collection("users").insertOne(newUser);
      res.status(201).send("User created");
    } catch (err) {
      res.status(500).send(err.message);
    }
  });
  



app.patch("/users/:userId", async (req, res) => {
  try {
    const { profilePicture } = req.body;
    const result = await db
      .collection("users")
      .updateOne({ userId: req.params.userId }, { $set: { profilePicture } });
    if (result.modifiedCount === 0) return res.status(404).send("User not found");
    res.send("Profile picture updated");
  } catch (err) {
    res.status(500).send(err.message);
  }
});


app.delete("/users/userId:", async (req, res) => {
  try {
    const result = await db.collection("users").deleteOne({ userId: req.params.userId });
    if (result.deletedCount === 0) return res.status(404).send("User not found");
    res.send("User deleted");
  } catch (err) {
    res.status(500).send(err.message);
  }
});


app.get("/videos", async (req, res) => {
  try {
    const videos = await db.collection("videos").find({}).toArray();
    res.json(videos);
  } catch (err) {
    res.status(500).send(err.message);
  }
});


app.get("/videos/:videoId", async (req, res) => {
  try {
    const video = await db.collection("videos").findOne({ videoId: req.params.videoId });
    if (!video) return res.status(404).send("Video not found");
    res.json(video);
  } catch (err) {
    res.status(500).send(err.message);
  }
});


// app.post("/videos", async (req, res) => {
//   try {
//     const newVideo = req.body;
//     await db.collection("videos").insertOne(newVideo);
//     res.status(201).send("Video uploaded");
//   } catch (err) {
//     res.status(500).send(err.message);
//   }
// });


app.post("/videos", async (req, res) => {
    try {
      const {
        videoId,
        title,
        description,
        uploader,
        views = 0,
        likes = 0,
        dislikes = 0,
        tags,
        videoUrl
      } = req.body;
  
      
      const newVideo = {
        videoId,
        title,
        description,
        uploader,
        views,
        likes,
        dislikes,
        tags,
        uploadDate: new Date(), 
        videoUrl
      };
  
      await db.collection("videos").insertOne(newVideo);
      res.status(201).send("Video uploaded");
    } catch (err) {
      res.status(500).send(err.message);
    }
  });
  



app.patch("/videos/:videoId/likes", async (req, res) => {
  try {
    const result = await db
      .collection("videos")
      .updateOne({ videoId: req.params.videoId }, { $inc: { likes: 1 } });
    if (result.modifiedCount === 0) return res.status(404).send("Video not found");
    res.send("Likes incremented");
  } catch (err) {
    res.status(500).send(err.message);
  }
});


app.delete("/videos/:videoId", async (req, res) => {
  try {
    const result = await db.collection("videos").deleteOne({ videoId: req.params.videoId });
    if (result.deletedCount === 0) return res.status(404).send("Video not found");
    res.send("Video deleted");
  } catch (err) {
    res.status(500).send(err.message);
  }
});


app.get("/videos/:videoId/comments", async (req, res) => {
  try {
    const comments = await db.collection("comments").find({ videoId: req.params.videoId }).toArray();
    res.json(comments);
  } catch (err) {
    res.status(500).send(err.message);
  }
});


// app.post("/comments", async (req, res) => {
//   try {
//     const newComment = req.body;
//     await db.collection("comments").insertOne(newComment);
//     res.status(201).send("Comment added");
//   } catch (err) {
//     res.status(500).send(err.message);
//   }
// });


app.post("/comments", async (req, res) => {
    try {
      const { commentId, videoId, userId, text, likes,postedAt} = req.body;
  

      const newComment = {
        commentId,
        videoId,
        userId,
        text,
        likes,
        postedAt: new Date() 
      };
  
      await db.collection("comments").insertOne(newComment);
      res.status(201).send("Comment added");
    } catch (err) {
      res.status(500).send(err.message);
    }
  });
  

app.patch("/comments/:commentId/likes", async (req, res) => {
  try {
    const result = await db
      .collection("comments")
      .updateOne({ commentId: req.params.commentId }, { $inc: { likes: 1 } });
    if (result.modifiedCount === 0) return res.status(404).send("Comment not found");
    res.send("Likes incremented");
  } catch (err) {
    res.status(500).send(err.message);
  }
});


app.delete("/comments/:commentId", async (req, res) => {
  try {
    const result = await db.collection("comments").deleteOne({ commentId: req.params.commentId });
    if (result.deletedCount === 0) return res.status(404).send("Comment not found");
    res.send("Comment deleted");
  } catch (err) {
    res.status(500).send(err.message);
  }
});


app.get("/playlists/:userId", async (req, res) => {
  try {
    const playlists = await db.collection("playlists").find({ userId: req.params.userId }).toArray();
    res.json(playlists);
  } catch (err) {
    res.status(500).send(err.message);
  }
});


// app.post("/playlists", async (req, res) => {
//   try {
//     const newPlaylist = req.body;
//     await db.collection("playlists").insertOne(newPlaylist);
//     res.status(201).send("Playlist created");
//   } catch (err) {
//     res.status(500).send(err.message);
//   }
// });


app.post("/playlists", async (req, res) => {
    try {
      const { playlistId, userId, name, isPublic, videos ,createdDate} = req.body;
  
     
      const newPlaylist = {
        playlistId,
        userId,
        name,
        videos, 
        createdDate: new Date(),
        isPublic 
      };
  
      await db.collection("playlists").insertOne(newPlaylist);
      res.status(201).send("Playlist created");
    } catch (err) {
      res.status(500).send(err.message);
    }
  });
  


app.put("/playlists/:playlistId/videos", async (req, res) => {
  try {
    const { videoId } = req.body;
    const result = await db
      .collection("playlists")
      .updateOne({ playlistId: req.params.playlistId }, { $push: { videos: videoId } });
    if (result.modifiedCount === 0) return res.status(404).send("Playlist not found");
    res.send("Video added to playlist");
  } catch (err) {
    res.status(500).send(err.message);
  }
});


app.delete("/playlists/:playlistId", async (req, res) => {
  try {
    const result = await db.collection("playlists").deleteOne({ playlistId: req.params.playlistId });
    if (result.deletedCount === 0) return res.status(404).send("Playlist not found");
    res.send("Playlist deleted");
  } catch (err) {
    res.status(500).send(err.message);
  }
});


app.get("/subscriptions/:userId", async (req, res) => {
  try {
    const subscriptions = await db
      .collection("subscriptions")
      .find({ subscriber: req.params.userId })
      .toArray();
    res.json(subscriptions);
  } catch (err) {
    res.status(500).send(err.message);
  }
});


// app.post("/subscriptions", async (req, res) => {
//   try {
//     const newSubscription = req.body;
//     await db.collection("subscriptions").insertOne(newSubscription);
//     res.status(201).send("Subscription added");
//   } catch (err) {
//     res.status(500).send(err.message);
//   }
// });




app.post("/subscriptions", async (req, res) => {
    try {
      const { subscriptionId, subscriber, channel,subscribedAt } = req.body;
  
     
      const newSubscription = {
        subscriptionId,
        subscriber,
        channel,
        subscribedAt: new Date() // 
      };
  
      await db.collection("subscriptions").insertOne(newSubscription);
      res.status(201).send("Subscription added");
    } catch (err) {
      res.status(500).send(err.message);
    }
  });
  











app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
