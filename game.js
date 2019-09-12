let config = {
    width: 800,
    height: 600,

    player_width: 5,
    player_height: 5,
    player_color: '#FF0',

    sky_color: '#7ed6df',
    ground_color: '#555',
    pipe_color: '#050',

    pipe_space: 100,
    pipe_width: 100,

    limit: 100,

};

let Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Body = Matter.Body,
    Composites = Matter.Composites,
    Constraint = Matter.Constraint,
    Events = Matter.Events,
    MouseConstraint = Matter.MouseConstraint,
    Mouse = Matter.Mouse,
    World = Matter.World,
    Bodies = Matter.Bodies;

// create engine
let engine = Engine.create(),
    world = engine.world;


// create renderer
let render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        width: config.width,
        height: config.height,
        wireframes: false,
        showAngleIndicator: false,
        background: './ciel.png',
    }
});
setTimeout(function () {
    Render.run(render);
}, 500);
Render.lookAt(render, {
    min: { x: 0, y: 0 },
    max: { x: config.width, y: config.height }
});

// create runner
let runner = Runner.create();
Runner.run(runner, engine);
engine.world.gravity.y = 0;

let pop = [],
    pipes = [],
    intervalWalls = null,
    intervalGame = null,
    neat = null,
    hightestScore = null;

let group = Body.nextGroup(true);

let players = [], end, level = 1;
let category = ['#ED4C67', '#130f40', '#686de0', '#dff9fb'];

let init = () => {
    players = [];
    for (let i = 1; i < 3; i++){
        players.push(Bodies.rectangle(5, config.height/2, config.player_width, config.player_height, {
            id: -i,
            //frictionAir: 0.1,
            collisionFilter: {group: group},
            veloce: 3,
            render: {
                sprite: {
                    texture: './flappy.png',
                    xScale: 1/10,
                    yScale: 1/10,
                }
            }
        }));
    }
    end = Bodies.rectangle(config.width - 20, config.height/2, 30, 30, {
        id: 0,
        isStatic: true,
        render: {
            fillStyle: category[0],
        },
    });
}

let createLevel = (level) => {
    World.clear(world);
    players.map((el) => {
        Body.setPosition(el, {x: 5, y: config.height/2});
        Body.setVelocity(el, {x: 0, y: 0});
    })
    
    
    let obstacles = [];
    for (let i = 0; i <= Math.sqrt(level) * 2; i++){
        let type = Math.round(Math.random() * (config.limit * (category.length - 1)) + 1);
        obstacles.push(Bodies.rectangle(
            Math.random() * (config.width / 2) + config.width / 4, 
            Math.random() * (config.height / 1.5) + config.height / 3, 
            Math.random() * config.width / 3 + 100, 
            Math.random() * config.height / 3 + 100, 
            {
                id: type,
                isStatic: true,
                isSensor: type > config.limit ? true : false,
                render: {
                    fillStyle: category[(type > config.limit ? type > config.limit*2 ? 3 : 2 : 1)],
                },
            }
        ));
        Body.rotate(obstacles[obstacles.length - 1], Math.random() * 360)
    }
    obstacles.sort((a, b) => {return b.id - a.id;});
    World.add(world, obstacles);
    World.add(world, players.concat(end));
};

Events.on(engine, 'collisionStart', function(e) {
    let pairs = e.pairs;
    for (let pair of pairs) {
        let player = players.find((el) => {return pair.bodyA.id === el.id || pair.bodyB.id === el.id});
        if (player){
            if ((pair.bodyA.id > config.limit && pair.bodyA.id <= config.limit * 2) || (pair.bodyB.id > config.limit && pair.bodyB.id <= config.limit * 2)){
                Body.setVelocity(player, {x: 0, y: 0});
                continue;
            }
            if ((pair.bodyA.id > config.limit * 2 && pair.bodyB.id <= config.limit * 3)  || (pair.bodyB.id > config.limit * 2 && pair.bodyB.id <= config.limit * 3)){
                Body.setVelocity(player, {x: 0, y: 0});
                continue;
            }            
            if (pair.bodyB.id === 0 || pair.bodyA.id === 0){
                level += 1;
                createLevel(level);
                return;
            }
        }
    }
});
Events.on(engine, 'collisionActive', function(e) {
    let pairs = e.pairs.length > 1 ? 
        e.pairs.sort((a, b) => {return b.bodyB.id - a.bodyB.id}) : e.pairs;
    for (let pair of pairs) {
        let player = players.find((el) => {return pair.bodyA.id === el.id || pair.bodyB.id === el.id});
        if (player){
            if ((pair.bodyA.id > config.limit && pair.bodyA.id <= config.limit * 2) || (pair.bodyB.id > config.limit && pair.bodyB.id <= config.limit * 2)){
                player.veloce = 5;
                continue;
            }
            if ((pair.bodyA.id > config.limit * 2 && pair.bodyB.id <= config.limit * 3)  || (pair.bodyB.id > config.limit * 2 && pair.bodyB.id <= config.limit * 3)){
                player.veloce = 1.5;
                continue;
            }
        }
    }
});
Events.on(engine, 'collisionEnd', function(e) {
    let pairs = e.pairs;
    for (let pair of pairs) { 
        if ((pair.bodyA.id < 0 || pair.bodyB.id < 0)){
            pair.bodyA.veloce = 3;
            pair.bodyB.veloce = 3;
        }
    }
});

//Controle of the player
let running = true;

let map = {};
document.onkeydown = document.onkeyup = function(e){
    e = e || event; // to deal with IE
    map[e.code] = e.type == 'keydown';   
};
Events.on(engine, 'tick', function(e) {
    for (let player of players) {
        if (player.position.y > config.height) Body.setPosition(player, {x: player.position.x, y: 0});
        if (player.position.y < 0) Body.setPosition(player, {x: player.position.x, y: config.height});
        if (map["ArrowLeft"])           Body.setVelocity(players[0], {x: -players[0].veloce, y: 0});
        if (map["ArrowRight"])          Body.setVelocity(players[0], {x: players[0].veloce, y: 0});
        if (map["ArrowUp"])             Body.setVelocity(players[0], {x: 0, y: -players[0].veloce});
        if (map["ArrowDown"])           Body.setVelocity(players[0], {x: 0, y: players[0].veloce});
        if (map["KeyA"])                Body.setVelocity(players[1], {x: -players[1].veloce, y: 0}); 
        if (map["KeyD"])                Body.setVelocity(players[1], {x: players[1].veloce, y: 0}); 
        if (map["KeyW"])                Body.setVelocity(players[1], {x: 0, y: -players[1].veloce});
        if (map["KeyS"])                Body.setVelocity(players[1], {x: 0, y: players[1].veloce});
    }
});

init();
createLevel(1);


