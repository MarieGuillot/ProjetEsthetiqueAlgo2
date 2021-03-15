//projet etendu

// -------------------
//  Parameters and UI
// -------------------

let backgroundTexture: p5.Graphics

let xDessin = 0; 
let yDessin = 0; 
let flagBouge = true;
let mouseInScreen;

let paper : p5.Image;

const gui = new dat.GUI()
const params = {
    Seed: 124,
    Long : -48,
    longFleur : -48,
    Angle : 0.77,
    PousseArbre : 5,
    tournePlante : 0,
    Download_Image: () => save(),
}
gui.add(params, "Seed", 0, 255, 1)
gui.add(params, "Long", -150, -1, 1)
gui.add(params, "longFleur", -150, 0, 1)
gui.add(params, "Angle", 0, 1.7, 0.001)
gui.add(params, "PousseArbre", 0, 12, 1)
gui.add(params, "tournePlante", -1.6, 1.6, 0.1)
gui.add(params, "Download_Image")

// -------------------
//       Drawing
// -------------------

// I just moved your code from draw() to here
// And prefix every function with "backgroundTexture." so that they are applied on the texture and not the screen directly

function generateBackgroundTexture() {
    // Mise en place du fond cyanotype
    backgroundTexture.push();
    backgroundTexture.imageMode(CENTER);
    backgroundTexture.translate(width/2, height/2);
    let pivotBackground= int(random(0,100));
    backgroundTexture.rotate(pivotBackground*(PI/2));
    backgroundTexture.image(paper, 0, 0, width, height);
    backgroundTexture.pop();

    // Noise
    backgroundTexture.blendMode(SOFT_LIGHT)
    let scale = random(0, 0.02)
    for (let i = 0; i < width; i++) {
        for (let j = 0; j < height; j++) {
            backgroundTexture.stroke(255, map(noise(i * scale, j * scale), 0, 1, 0, 200));
            backgroundTexture.point(i, j);
        }
    }
    backgroundTexture.blendMode(BLEND)
}

function gradientLine(Longueur, alpha) {
    let colorStart = color(`rgba(255, 255, 255,${alpha})`);
    let colorEnd = color('rgba(255, 255, 255, 0)');

    for (let i=0; i>=Longueur; i--) {
        let c = lerpColor(colorStart, colorEnd, (1/Longueur)*i);
        strokeWeight(1.5); 
        stroke(c);
        line(0, i, 0, i-1);
    }

}

function smallLine (stop) {

    if (stop == 0) {
        stop = 2;
    }
    let reduction = 0.1*(5+stop);
    let longueurLigne = params.Long*random(0.7,1)*reduction;

    if (stop > 2) {
        let dir;
        if(stop%2 == 0) { dir = -1 } else {dir = 1 }
        push()
        let angle2 = dir*params.Angle/(stop*2);
        rotate(angle2); 
        smallLine(1)
        smallLine(1)
        pop() /*
        if (stop == 3) {
        push()
        let angle2 = -dir*params.Angle/(stop*2);
        rotate(angle2); 
        smallLine(1)
        smallLine(1)
        pop() 
        }*/
    }
   

    let j = 0;
    while (j<2) {
        gradientLine(longueurLigne, 1); 
        push();
        let angle = ((PI/12) - j*(PI/7));
        rotate(-angle); 
        gradientLine((3-j)*(2/3)*longueurLigne, 1); 
        pop();
        translate(0,longueurLigne);
        j++;
    }   
    gradientLine(longueurLigne, 1); 
    translate(0,(1/2)*longueurLigne);
    
}

function divisePlant (stop, direction) {
    
    push();
    let reduction = 0.05*(15+stop);
    let angle = reduction*direction*params.Angle;
    rotate(angle);
    smallLine(stop);
    
        
        if (stop>1) {

            let dir;
            if(stop%2 == 0) { dir = 1 } else {dir = -1 }

            push();
            divisePlant(stop-1, 0);
            pop();  
            push();
            divisePlant(stop-2, dir);
            pop(); 

        }
        if (stop==1) {
            let extremite = int(random(1,3))
            if (extremite==1) {
                feuille()
            }
            else {
            translate(0,params.Long*reduction*(1/3))
            fleur();
            }
        }
    
    pop();
}

function feuille() {
    let longFeuille = params.Long;
    let angle = params.Angle*1.2;
    let iMax;
    if (longFeuille<-30) {
    iMax = -longFeuille/5;
    }
    else {
    iMax = 6;
    }
    let arrondi;
    let forme = random(2,5);

    for (let i=1; i<iMax; i++) {
    gradientLine(longFeuille/iMax, 1);
    push();
    rotate(-angle); 
    arrondi = map(i, 0, iMax, 0, 1);
    gradientLine(longFeuille*sin(PI*sqrt(arrondi))*(1/forme), 1); 
    rotate(2*angle); 
    gradientLine(longFeuille*sin(PI*sqrt(arrondi))*(1/forme), 1); 
    
    
    pop();
    translate(0,longFeuille/iMax);
    }

}

function fleur() {
   let nbPetales = random(20,40);
   let reducLong = random(1,5);
   let longPetales = params.longFleur/reducLong;
   let nbCouches = random(1,8);
   let longCouches = longPetales/nbCouches;
   let transparence = 0.8/(nbCouches);
   let taillePetale = 1;
   let facteur = 1;

   for (let j=0; j<nbCouches; j++) {
        for (let i=0; i<nbPetales; i++) {
            rotate(TWO_PI/nbPetales+j*(PI/8)); 
            gradientLine((nbCouches-j)*longCouches*taillePetale, 0.2+j*transparence);

            push()
            translate(0, (nbCouches-j)*longCouches*taillePetale)
            fill(`rgba(255,255,255,${j*(0.2/nbCouches)})`)
            ellipse(0,0,((nbCouches-j)*longCouches*taillePetale))
            noFill()
            pop()  
            

            if(i%2==0) {facteur = facteur*(-1)}
            taillePetale = taillePetale+facteur*0.1
        }
   }
   
}

function bougeDessin() {

    noFill();
    if (flagBouge) {
        if(mouseInScreen) {
            xDessin = mouseX; 
            yDessin = mouseY; 
        }
        else {
            xDessin = width/2; 
            yDessin = 4*height/5; 
        }
           
    } 
    
    translate(0, 0);
    translate(xDessin, yDessin);
}

function mouseClicked() {
    if (mouseInScreen) {
    flagBouge=false;
    }
}

function draw() {
    // Détermine si la souris est dans l'ecran
    mouseInScreen = (mouseX >-10 && mouseX<width+10 && mouseY>-10 && mouseY<height+10);
    // Initialise la seed
    randomSeed(params.Seed);
    // Texture de fond
    image(backgroundTexture, 0, 0, width, height);

    // Emplacement dessin
    bougeDessin();
    rotate(params.tournePlante);

    // Dessin de la plante
    
    let longueurArbre = params.PousseArbre;
    divisePlant(longueurArbre, 0);
    divisePlant(longueurArbre-1, 1);
    
}

// -------------------
//    Initialization
// -------------------

function preload() {
    paper = loadImage("../img/cyanotypePaper.jpg");
}

function setup() {
    p6_CreateCanvas()
    backgroundTexture = createGraphics(width, height)
    generateBackgroundTexture()
}

function windowResized() {
    p6_ResizeCanvas()
    backgroundTexture.resizeCanvas(width, height)
    generateBackgroundTexture()
}
