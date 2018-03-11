# Multiplayer Time

Mutiplayer Time is a free online multiplayer games website, it is web based so it will work on a variety of devices and operating systems.

I really enjoy playing video games, and one of the problems nowadays is when I want to play any online game on my smart phone, I don’t really find any fun game to play with my friends, and when I think they are good I need to make an installation of the game, so I can try it, and so many times when I want to play with my friends I may use android and they iOS, so it becomes unlikely to play with them most of the times, Multiplayer Time is one solution for the problems that I mentioned above, it is an website with couple of games, that any person can play, all you need is a device with a modern web browser, internet and an account. You can also add your friends to your friend list, and then invite them to your game lobby, it is cross platform you can play with an android vs an iOS, and you can pay with a computer vs android.

This project was developed under my degree in computer engineering, and I had almost zero experience in video games and the technologies that I chose to build this project.

The only experience I had with game develop it was in Flash and Unity 3D but I learn it from myself, and for this project I want to do something by myself, with no framework.

So, to build this platform I used Node.js, Swagger, MongoDB and Socket.io, and for front end I used AngularJs, I had no experience with this stack of development and tools and if I started today it would be different,
This project is a website but it will give you some libraries if you want to make your own games, they are simple and are simple to use, below a Talk more about them.

<p align="center">
  <span>
    <img
      alt="Multiplayer Time"
      src="https://i.imgur.com/egy7n7k.png"
      width="300"
    />
</span>
</p>

[![Play Video](https://img.youtube.com/vi/IR_iZrgot78/0.jpg)](https://youtu.be/IR_iZrgot78)


### Project directory layout

```
.
├── api                         #folder of swagger REST API
|   ├── config                  #Configurations
|   ├── controllers             #Controllers of routes
|   ├── mocks                   #libs that controllers use
|   ├── models                  #models used in routes
|   └── swagger                 #swagger folder
├── config 
├── games                       #views for games
├── multiplayer_time_database   #database backup files so you can restore them
├── public                      #website public folder
|   ├── admin                   #admin views
|   ├── css 
|   ├── fonts
|   ├── images
|   ├── sounds
|   ├── uploads                 #uploads from website goes to here
|   └── scripts                 #all javascript stuff
├── servers                     #game servers project folder
├── test/api                    #REST API tests
├── views                       #views from website
├── README.md
├── LICENSE.md
├── app.js                      #website start point
├── notifications.js            #notifications server start point
└── package.json
```

## Prerequisites

You will need to install some software before running this project.

Below are the software you need to install on your machine.

<br/>

<p align="center">
  <span><a href="https://nodejs.org/">
    <img
      alt="Node.js"
      src="https://nodejs.org/static/images/logo-light.svg"
      height="50"
    />

  </a>
</span>
</p>

#### Node.js
Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine. For more information on using Node.js, see the [Node.js Website](https://nodejs.org/en/).

#### npm
npm is the package manager for JavaScript and the world’s largest software registry. Discover packages of reusable code and assemble them in powerful new ways, see the [npm Website](https://www.npmjs.com/get-npm)

#### MongoDB

MongoDB is a document database with the scalability and flexibility that you want with the querying and indexing that you need, see the [MongoDb Website](https://docs.mongodb.com/manual/installation/).
Remeber to run MongoDb server before running the website.



## Usage

If you installed all the prerequisites you are now ready to try out the project, first of all you need to clone the project to your machine.

```
git clone https://github.com/micaelsampaio/multiplayertime.git
```

### Website and Notifications Server

Now you have all the project on your side, remember that you need to install all the modules dependencies in other to run the project.

```
npm i
//or 
npm run install 
```

**Remeber to run MongoDb server before running the website.**

If this is the first time you are using the project you need to restore the database with the following command.

```
npm run create:db
```

Now that you have all the modules dependencies installed, you are ready to run the Website. 
The command start will start the website and rest api, and it will also runs the notifications server.

```
npm start
//Or if you want to run them separated 
npm run start:web
npm run start:notifications
```

You are not ready to play in order to play you need an account and to run the games servers.
You can create account but I will give you some default users.

| Username | Password |
| --- | --- |
| micael | 1234 |
| user123 | 1234 |
| emanuel | 123456|
|marcopaulo | 123456|


### Game Servers
Alright, now you have the website and all the dependencies, now you need to start the game servers, all the games server are on a same folder /servers but initially they were different projects, but it is easier to run it in a same project, each server runs on a different port.
You need to install all dependencies, you can run all the servers at once or separately. 


```
cd servers
npm i
npm run start
```

Or if you want run all the servers separately.

```
cd servers
npm run start:dangerous-forest
npm run start:flying-unicorns
npm run start:four-in-row
npm run start:from-the-tower
npm run start:stick-mountains
npm run start:sueca
```

## Games

<p align="center">
  <span>
    <img
      alt="Node.js"
      src="https://i.imgur.com/trfRvhd.png"
      width="500"
    />
</span>
</p>

<p align="center">
  <span>
    <img
      alt="Node.js"
      src="https://i.imgur.com/Jsdqa4n.png"
      width="500"
    />
</span>
</p>

<p align="center">
  <span>
    <img
      alt="Node.js"
      src="https://i.imgur.com/tycawiv.png"
      width="500"
    />
</span>
</p>

<p align="center">
  <span>
    <img
      alt="Node.js"
      src="https://i.imgur.com/TA1QGtl.png"
      width="500"
    />
</span>
</p>

<p align="center">
  <span>
    <img
      alt="Node.js"
      src="https://i.imgur.com/goqYxxC.png"
      width="500"
    />
</span>
</p>

<p align="center">
  <span>
    <img
      alt="Node.js"
      src="https://i.imgur.com/02h4S9s.png"
      width="500"
    />
</span>
</p>

## Author

* **Micael Sampaio** - [Linkedin](https://www.linkedin.com/in/micaelsampaio/)


## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

