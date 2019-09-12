class Player{
    constructor(user, group, brain) {
        this.user = user;
        this.brain = {};
        if (brain) {
            this.brain = brain;
        }
		this.brain.score = 0;
        this.body = Bodies.circle(150, config.height / 2, config.bird_width, {
            render: {
                fillStyle: config.bird_color,
                sprite: {
                    texture: './flappy.png',
                    xScale: .4,
                    yScale: .4,
				}
            },
            id: Math.floor(Math.random() * 1000),
            alive: true,
            collisionFilter: {
                group: group,
            },
        });
    }
	jump() {
        Body.setVelocity(this.body, {x: 0, y: config.jump_force});
	};

    getData() {
    	if (this.body.position.y > config.height || this.body.position.y < 0)
            this.body.alive = false;
    	if (!this.body.alive && this.user){
    		start();
    		return;
    	}
		//console.log(this.body.alive + ' ' + this.brain.score);
		
        this.brain.score++;

		let minWidth = 1000;
		let height = 0;
		let posY = 0, x, y;
		pipes.map((pipe) => {
			if (this.user && pipe.position.x < 100 && pipe.alive){
				pipe.alive = false;
				if (this.user){
					document.getElementById("score").innerHTML = this.brain.score;
				}
			}
			if (pipe.alive && minWidth > pipe.position.x - this.body.position.x && pipe.position.x + config.pipe_width - this.body.position.x > 0){
			    minWidth = pipe.position.x - this.body.position.x;
			    height = config.height - this.body.position.y - pipe.posY;
			    posY = pipe.posY;
			    x = pipe.position.x;
			    y = pipe.position.y;
			}
		});
		return [minWidth, height];//, this.body.position.x, this.body.position.y, x, y, posY];
	
	};

	ia() {
	    if (this.body.alive) {
            let output = this.brain.activate(this.getData());
            if (output > .5) this.jump();
        }
	}
}