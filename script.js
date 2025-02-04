class Game{

    constructor(canvas,context){
        this.ctx = context
        this.canvas = canvas
        this.gameOver=false
        this.obstacles = []
        this.obstaclesTimer = 200
        this.score=0

        this.resizeCanvas()
        window.addEventListener('resize',()=>this.resizeCanvas())
    }

    resizeCanvas(){

        const isMobile = window.innerWidth <=768

        if (isMobile) {
            this.canvas.width = window.innerWidth; // 100% width on mobile
            this.canvas.height = window.innerHeight;
        } else {
            this.canvas.width = window.innerWidth * 0.4;
            this.canvas.height = window.innerHeight -10;
        }

    }


    onStart(){
        this.player1 = new Player(this.ctx,this.canvas)
        this.gameOver=false
        this.player1.gameOver=false
        this.player1.x = (this.canvas.width - this.player1.width) / 2;
        this.player1.draw()
        this.gameLoop()

        this.canvas.addEventListener('touchstart', () => {
            this.player1.jump(); // Trigger the jump logic
        });

        window.addEventListener('keydown', (e) => {
            
            if(e.code==='Space'){

                this.player1.jump(); // Trigger the jump logic
            }
        });
    }


    gameLoop(){

        if (this.gameOver || this.player1.gameOver) {
            this.obstacles=[]
            this.score=0
            return; // Stop the game loop if the game is over
        }

        this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height)
        this.player1.update()
        this.player1.draw()
        this.drawScore()


        for (let i = 0; i < this.obstacles.length; i++) {
            if (this.obstacles[i]) {  // Check if the obstacle is not undefined
                this.obstacles[i].draw();

                this.calculateScore(this.player1,this.obstacles[i])

                if(this.collisionDetection(this.player1,this.obstacles[i])){
                    this.gameOver=true
                    this.player1.showGameOver('Restart?')
                }
                this.obstacles[i].update(this.obstacles);
                
            }
            
        }



        if(this.obstaclesTimer==260){
            this.obstacles.push(new Obstacles(this.ctx,this.canvas,"left"))
            this.obstacles.push(new Obstacles(this.ctx,this.canvas,"right"))
            this.obstaclesTimer=0
        }else{
            this.obstaclesTimer++
        }


        requestAnimationFrame(()=> this.gameLoop())
        

    }

    collisionDetection(player,obstacle){

        return player.x<obstacle.x+obstacle.width&&
               player.x+player.width>obstacle.x&&
               player.y<obstacle.y+obstacle.height&&
               player.y+player.width>obstacle.y
        

    }

    calculateScore(player,obstacle){

        if(player.y+player.height<obstacle.y&&
            !obstacle.scored){
            this.score+=0.5
            obstacle.scored=true
            // console.log('Score :',this.score)
        }

    }

    drawScore(){
        this.ctx.font = '20px Arial' 
        this.ctx.fillStyle = 'black'
        this.ctx.textAlign = 'right'
        this.ctx.fillText(`Score: ${this.score}`, this.canvas.width - 10, 30)
    }

}


class Player{

    constructor(CanvasContext,CanvasInfo){
        this.ctx=CanvasContext;
        this.canvas = CanvasInfo;
        this.width=50
        this.height=50
        this.x = (this.canvas.width - this.width) / 2;
        this.y=200
        this.velocityY = 0
        this.gravity = 0.5
        this.jumpPower = -12
        this.gameOver=false

    }

    draw(){
        this.ctx.fillRect(this.x,this.y,this.height,this.width)
    }

    update(){

        this.groundLevel = this.canvas.height - 50;

        if(this.y==this.groundLevel || this.y< -100){
            this.y = this.groundLevel
            this.gameOver=true
            this.showGameOver('Restart?')
        }
        else if(this.y+this.height<this.canvas.height){
            this.velocityY+=this.gravity
        }else{
            this.velocityY = 0; // Stop falling when on the ground
            this.y = this.groundLevel;
            this.gameOver=true
            this.showGameOver('Restart?')
        }

        this.y+=this.velocityY

    }

    jump(){
        if (this.gameOver) return;
        this.velocityY = this.jumpPower
    }

    showGameOver(message) {
        document.querySelector('#dialoge1').style.display = 'flex';
        document.querySelector('#messege').innerText = 'Game Over!!\n\n' + message;
        document.querySelector('#button1').innerText = 'Restart';
    }
}

class Obstacles{

    constructor(context,CanvasContext,objectPlaced){

        this.ctx = context
        this.canvas = CanvasContext
        
        this.randomChance = Math.random()>0.5
        
        if (this.randomChance) {
            this.width = (this.canvas.width / 2) + 30; // Start big
            this.growing = false; // Shrink first
        } else {
            this.width = 0; // Start small
            this.growing = true; // Grow first
        }


        

        this.height = 50;
        this.y=-10
        this.speed=2
        this.widthChangeSpeed = 6
        this.growing = true
        this.objectPlaced = objectPlaced
        this.scored = false

    }
    draw(){
        this.ctx.fillRect(this.x,this.y,this.width,this.height)
    }
    update(obstacles){
        this.y+=this.speed
        
        if (this.growing) {
            this.width += this.widthChangeSpeed;
            if (this.width >= this.canvas.width / 2 + 30) {
                this.growing = false; // Start shrinking
            }
        } else {
            this.width -= this.widthChangeSpeed;
            if (this.width <= 0) {
                this.growing = true; // Start growing
            }
        }

        // Adjust x position for right obstacle
        if (this.objectPlaced === "right") {
            this.x = this.canvas.width - this.width;
        }else if (this.objectPlaced === 'left') {
            this.x = 0; // Left side
        }

        // Draw the obstacle
        this.draw();
        

        
        
        if(this.y+this.height>this.canvas.height+50){

            const index = obstacles.indexOf(this)
            // console.log(index)
            if (index > -1) {
                obstacles.splice(index, 1);
                // console.log(obstacles)
            }

        }


        
    }

}


const canvas = document.querySelector('#canvas1')

const ctx = canvas.getContext('2d')


let game1 = new Game(canvas,ctx)


function startGame(){

    document.querySelector('#dialoge1').style.display = 'none'

    game1.onStart()

}

