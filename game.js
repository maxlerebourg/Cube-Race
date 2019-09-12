let config = {
    width: 800,
    height: 600,

    player_width: 5,
    player_height: 5,
    player_color: '#FF0',

    sky_color: '#4c4c4a',
    ground_color: '#555',
    pipe_color: '#050',

    pipe_space: 100,
    pipe_width: 100,

    limit: 100,
    vitesse: 1,

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
        background: config.sky_color,
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
let category = ['#ED4C67', '#000000', '#fff', '#e4ea9b'];

let init = () => {
    players = [];
    for (let i = 1; i < 3; i++){
        players.push(Bodies.circle(5, config.height/2, config.player_width, {
            id: -i,
            //frictionAir: 0.1,
            collisionFilter: {group: group},
            veloce: config.vitesse,
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
            sprite: {
                texture: './end.png',
            }
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
    for (let i = 0; i <= Math.sqrt(level) * 6; i++){
        let type = Math.round(Math.random() * (config.limit * (category.length - 1)) + 1);
        obstacles.push(Bodies.rectangle(
            Math.random() * (config.width -100) + 50, 
            Math.random() * config.height, 
            Math.random() * config.width / 6 + 50, 
            Math.random() * config.height / 6 + 50, 
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
    World.add(world, [end].concat(players));
};

Events.on(engine, 'collisionActive', function(e) {
    let pairs = e.pairs.length > 1 ? 
        e.pairs.sort((a, b) => {return b.bodyB.id - a.bodyB.id}) : e.pairs;
    for (let pair of pairs) {
        let player = players.find((el) => {return pair.bodyA.id === el.id || pair.bodyB.id === el.id});
        if (player){
            if ((pair.bodyA.id > config.limit && pair.bodyA.id <= config.limit * 2) || (pair.bodyB.id > config.limit && pair.bodyB.id <= config.limit * 2)){
                player.veloce = config.vitesse * 2;
                continue;
            }
            if ((pair.bodyA.id > config.limit * 2 && pair.bodyB.id <= config.limit * 3)  || (pair.bodyB.id > config.limit * 2 && pair.bodyB.id <= config.limit * 3)){
                player.veloce = config.vitesse / 2;
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
Events.on(engine, 'collisionEnd', function(e) {
    let pairs = e.pairs;
    for (let pair of pairs) { 
        if ((pair.bodyA.id < 0 || pair.bodyB.id < 0)){
            pair.bodyA.veloce = config.vitesse;
            pair.bodyB.veloce = config.vitesse;
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
        if (player.position.x > config.width) Body.setPosition(player, {x: config.width, y: player.position.y});
        if (player.position.x < 0) Body.setPosition(player, {x: 0, y: player.position.y});
        if (map["ArrowLeft"])           Body.translate(players[0], {x: -players[0].veloce, y: players[0].velocity.y});
        if (map["ArrowRight"])          Body.translate(players[0], {x: players[0].veloce, y: players[0].velocity.y});
        if (map["ArrowUp"])             Body.translate(players[0], {x: players[0].velocity.x, y: -players[0].veloce});
        if (map["ArrowDown"])           Body.translate(players[0], {x: players[0].velocity.x, y: players[0].veloce});
        if (map["KeyA"])                Body.translate(players[1], {x: -players[1].veloce, y: players[1].velocity.y}); 
        if (map["KeyD"])                Body.translate(players[1], {x: players[1].veloce, y: players[1].velocity.y}); 
        if (map["KeyW"])                Body.translate(players[1], {x: players[1].velocity.x, y: -players[1].veloce});
        if (map["KeyS"])                Body.translate(players[1], {x: players[1].velocity.x, y: players[1].veloce});
    }
});

init();
createLevel(1);


