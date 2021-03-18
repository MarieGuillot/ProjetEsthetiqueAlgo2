//projet etendu

// -------------------
//  Parameters and UI
// -------------------

let noiseShader: p5.Shader;
let noiseTexture: p5.Graphics;

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
    longFeuilles : -48,
    Angle : 0.77,
    PousseArbre : 5,
    tournePlante : 0,
    NoiseScale : 1,
    NoiseSeed : 1,
    iterationsLSystem : 4,
    changePlante: () => switchPlant(),
    Download_Image: () => save(),

}
gui.add(params, "Seed", 0, 255, 1)
gui.add(params, "Long", -300, -1, 1)
gui.add(params, "longFleur", -600, 0, 1)
gui.add(params, "longFeuilles", -600, 0, 1)
gui.add(params, "Angle", -1.7, 1.7, 0.001)
gui.add(params, "PousseArbre", 0, 12, 1)
gui.add(params, "iterationsLSystem", 1, 8, 1)
gui.add(params, "tournePlante", -1.6, 1.6, 0.1)
gui.add(params, "NoiseScale", 0.6, 2.9, 0.1)
gui.add(params, "NoiseSeed", 0.1, 1, 0.0001)
gui.add(params, "changePlante")
gui.add(params, "Download_Image")

// -------------------
//      Fonctions de dessins
// -------------------


// Bouton pour changer de plante

let typePlant = 3;

function switchPlant() {
  if (typePlant < 3) {
    typePlant ++;
    if (typePlant == 2) {axiom = "F"}
    else {axiom = "X"}
  } else if (typePlant==3) {
    typePlant = 0;
  }
  choisiExtremite()
  ruleEnCours = rules[typePlant]
}

// Ligne de base

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
        pop() 
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

// Plante 1

function divisePlant (stop, direction) {
    
    push();
    let reduction = 0.05*(15+stop);
    let aleaAngle = random(0.5, 1.5);
    let angle = reduction*direction*params.Angle*aleaAngle;
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

// Plante 2 L-System


var axiom = "X";
var extremite1 = "G"
var extremite2 = "E"

var sentence = axiom;
var len = params.Long;
var alphaLS = 1;

var ruleFleur = {
  a: "G",
  b: "[O]"
};

var ruleFeuille = {
    a: "E",
    b: "[-L]"
}

var ruleA = []
//ruleA0 dans choisiExtremite
ruleA[1] = {
    a: "F",
    b: "FF"
}
ruleA[2] = ruleFeuille;
ruleA[3] = ruleFleur;

var ruleB = []
//ruleB0 dans choisiExtremite
ruleB[1] = ruleA[1]
ruleB[2] = ruleA[2]
ruleB[3] = ruleA[3]


var ruleC = []
ruleC[0]= {
  a: "X",
  b: "+FY"
}
ruleC[1]= {
  a: "Y",
  b: "-FX"
}
ruleC[2] = {
  a: "F",
  b: "FF-[XY]+[XY]"
}


var rules = []
rules[0] = ruleA;
rules[1] = ruleB;
rules[2] = ruleC;

var ruleEnCours;

function generate() {
    len *= 0.6;
    alphaLS *= 0.8;
    var nextSentence = "";
    for (var i = 0; i < sentence.length; i++) {
      var current = sentence.charAt(i);
      var found = false;
      for (var j = 0; j < ruleEnCours.length; j++) {
        if (current == ruleEnCours[j].a) {
          found = true;
          nextSentence += ruleEnCours[j].b;
          break;
        }
      }
      if (!found) {
        nextSentence += current;
      }
    }
    sentence = nextSentence;
    
  }


function turtle() {
  var angleLSystem = params.Angle;
    for (var i = 0; i < sentence.length; i++) {
      var current = sentence.charAt(i);
      
      if (current == "F") {
        gradientLine(len, alphaLS); 
        translate(0, len);
      } else if (current == "+") {
        rotate(angleLSystem);
      } else if (current == "-") {
        rotate(-angleLSystem)
      } else if (current == "[") {
        push();
      } else if (current == "]") {
        pop();
      } else if (current == "O") {
        fleur();
      }
      else if (current == "L") {
        gradientLine(len, alphaLS); 
        translate(0, len);
        feuille();
      }
    }
  }

function choisiExtremite() { // Determine la presence/position des fleurs et feuilles
  if (random(0,10)<=5) {
    extremite1 = "G"
  } else {
    extremite1 = "E"
  }
  if (random(0,10)<5) {
    extremite2 = "E"
  } else {
    extremite2 = "G"
  }

  ruleA[0] = {
    a: "X",
    b: "F[+X"+extremite1+"]F[-X"+extremite2+"]+X"
  }

  ruleB[0] = {
    a: "X",
    b: "F-[[X]+X"+extremite1+"]+F[+FX"+extremite2+"]-X"
  }

}

// Feuille

function feuille() {
    let longFeuille = params.longFeuilles;
    let angle = radians(20);
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

// Fleur

function fleur() {
   let nbPetales = random(20,40);
   let reducLong = random(1,5);
   let longPetales = params.longFleur/reducLong;
   let nbCouches = random(1,8);
   let longCouches = longPetales/nbCouches;
   let transparence = 0.8/(nbCouches);
   let taillePetale = 1;
   let facteur = 1;

   if (params.longFleur!=0) {
   for (let j=0; j<nbCouches; j++) {
        for (let i=0; i<nbPetales; i++) {
            rotate(TWO_PI/nbPetales+j*(PI/8)); 
            gradientLine((nbCouches-j)*longCouches*taillePetale, 0.01+j*transparence);

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
   
}

// Déplacement de la plante

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

/* Code de Dessin */

function draw() {
    // Détermine si la souris est dans l'ecran
    mouseInScreen = (mouseX >-10 && mouseX<width+10 && mouseY>-10 && mouseY<height+10);
    // Initialise la seed
    randomSeed(params.Seed);
    
    // Mise en place du fond cyanotype
    push();
    imageMode(CENTER);
    translate(width/2, height/2);
    let pivotBackground= int(random(0,100));
    rotate(pivotBackground*(PI/2));
    image(paper, 0, 0, width, height);
    pop();

    // Draw the noise on a texture
    noiseTexture.shader(noiseShader);
    noiseShader.setUniform("uAspectRatio", width/height);
    noiseShader.setUniform("uNoiseScale", params.NoiseScale);
    noiseShader.setUniform("uNoiseSeed", params.NoiseSeed);
    noiseTexture.noStroke();
    noiseTexture.rect(-width/2, -height/2, width, height);

     // Apply the noise texture
     blendMode(SOFT_LIGHT);
     push()
     imageMode(CENTER);
     translate(width/2, height/2);
     let pivotTex= int(random(0,100));
     rotate(-pivotTex*(PI/2));
     image(noiseTexture, 0, 0, width, height);
     pop()
     blendMode(BLEND);
   
    push()
    // Emplacement dessin
    bougeDessin();
    rotate(params.tournePlante);

    // Dessin de la plante 
    if (typePlant>2) {
    let longueurArbre = params.PousseArbre;
    divisePlant(longueurArbre, 0);
    divisePlant(longueurArbre-1, 1);
    }
  
    //Plante L-system
    if (typePlant<=2){
      let iterationLSystem = params.iterationsLSystem;
      for (let i=0; i<iterationLSystem; i++) {
        generate();
      }
      turtle();
       // Attention à réinitialiser les valeurs à chaque tour
      sentence = axiom;
      len = params.Long;
      alphaLS = 1;
    }
    
    pop()

}

// -------------------
//    Initialization
// -------------------

function preload() {
    paper = loadImage("../img/cyanotypePaper.jpg");
    noiseShader = loadShader("../shader/vertex.vert", "../shader/noise.frag")
}

function setup() {
    p6_CreateCanvas()
    noiseTexture = createGraphics(width, height, WEBGL)
}

function windowResized() {
    p6_ResizeCanvas()
    noiseTexture.resizeCanvas(width, height)
}
