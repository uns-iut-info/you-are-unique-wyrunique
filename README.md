# Lost in Yourself

[Accéder au jeu](https://game-on-web.herokuapp.com/)

[Vidéo de démonstration](/public/D%C3%A9mo%20jeu.mp4)

> Jeu produit par les membres de l'équipe **Wyruniqe**

> Ce jeu a été développé dans le cadre du concours **Games On Web 2022** organisé par [**CGi**](https://www.cgi.com/france/fr-fr/event/games-on-web-2022).

## Présentation du jeu

```
Encerclé par le désespoir, chutant au plus profond des ténèbres qu'est devenu votre esprit,  
vous avez perdu de vue qui vous êtes. 
Au bout d'un temps, il faut que ça éclate.

Ce qui est éparpillé dans cet étrange endroit, c'est vous. 
Vous vous êtes perdu. 
Chaque partie de votre être est maintenant égarée.  
Elles sont cependant toujours une part de vous, et vous en avez besoin. 
Perdu dans le labyrinthe de votre âme, vous allez devoir recoller les morceaux  
à l'aide de chacunes de ces parties pour passer outre les obstacles.
Serez-vous en mesure de venir à bout du labyrinthe et de ses épreuves  
sur la voie de la guérison afin de redevnir l'être que vous étiez ? 

```

### Commandes de jeu 

Afin de profiter pleinement de votre expérience de jeu voici les commandes:

- ``` z, q, s, d ``` afin de déplacer la boule que vous contrôlez.

- ``` & ``` afin de prendre le contrôle d'une autre boule.

- Les flèches directionnelles ou bien la souris afin de contrôler les mouvements de la caméra.

- La touche ```échap``` peut vous permettre de passer la cinématique de début.

### Idée du jeu

Cette année le thème du concours est **You are Unique**.
Notre toute première idée a été un jeu basé sur du combat aérien dans un monde fantastique.  
On s'est alors dit que notre monture de combat serait un dragon.  
Après quelques heures à découvrir la librairie de programmation ainsi qu'à réfléchir à l'articulation de notre jeu, nous avons décidé de faire un changement radical d'idée. Il y a 2 raisons à cela:

- Bien que nous ayons pour idée de faire des combats aériens avec pour but d'être le dernier survivant et donc d'être *unique* dans le sens où nous sommes le meilleur, nous n'étions que partiellement convaincu.

- La gestion d'un modèle de dragon et des combats aériens avec la librairie nous a semblé être une tâche vraiment compliquée à réaliser avec le peu d'expérience que l'on avait.

Après un peu de réflexion, de programmation et de discussion nous est venue l'idée d'un labyrinthe. Il nous fallait maintenant trouver comment exprimer l'unicité à travers ça.  
C'est alors qu'un de nos membres a eu l'idée de répartire différentes entités au fil d'un labyrinthe avec pour seul but de les rassembler et de ne former qu'un. L'idée a été complétée par le fait d'incarner un être égaré dans les méandres de son esprit devant recouvrer chaque partie de soi.  
Ainsi est né **Lost in Yourself**.

### Phase de développement

Le processus de réalisation du jeu a été composé de plusieurs étapes.

- Dans une démarche d'apprentissage l'un de nos membres a réalisé cette très belle imitation d'un pokémon qui lui a permis malgré tout d'apprendre à maîtriser un peu les différents types de *mesh*, les dimensions, les positions et d'autres éléments très utiles.

![Découverte de BabylonJS](/public/images/readme/pr%C3%A9mice.png)

- Donc, une fois le développement du jeu lancé il nous fallait établir une version très minimale de ce qu'on voulait.  
C'est-à-dire, une boule sur un plateau qui peut évoluer entre des murs.  
Il a donc fallu établir toute la *scene*, les différents *mesh*, assigner des *bindings* afin de pouvoir déplacer la boule et nous avons également utilisé le moteur physique *cannon.js* afin de gérer toutes les relations physiques et collisions entre la boule et les murs.  
Voici un petit aperçu.  

![Première version](/public/images/readme/avant-blender1.png)  

![Première version](/public/images/readme/avant-blender2.png)

> Ici, il s'agit d'une version un peu plus avancée car on y retrouve le nuage de particule qui sert d'indicateur pour le portail de sortie du labyrinthe. 

- Nous avons pendant un temps pensé à utiliser une texture de miroir sur les murs du labyrinthe mais l'idée n'a pas été conservée.

![miroir](/public/images/readme/miroir.png)  


- Une fois cette première version faite, il nous a paru naturel d'attaquer le vif du sujet, la labyrinthe.  
Nous avons d'abord pensé à utiliser un algorithme pour générer de manière aléatoire un labyrinthe puis ensuite de le modéliser à l'aide de bloc, mais cette solution ne nous paraissant pas la plus simple, nous avons décidé de le modéliser à l'aide du logiciel **Blender**.

![modélisation](/public/images/readme/blender.png)  

> On a ici une vue supérieure de la modélisation d'un de nos niveaux.

- Après que les labyrinthe aient été réalisés, nous les avons intégrés à notre code, et nous leur avons assignés des textures, ce qui a donné lieux à quelques mésaventures et tests.

![problème de taille](/public/images/readme/scaling.png)  

![mauvaise texture](/public/images/readme/floor-is-lava.png)  

- En parallèle de la création des labyrinthes, une interface graphique a été développée afin de rendre plus agréable et intuitive l'expérience de jeu.  
L'interface est sobre et simple, composée de boutons nous permettant de sélectionner des niveaux, connaître les commandes ou tout simplement de jouer.

![page de démarrage](/public/images/readme/d%C3%A9marrage.png)  

![menu](/public/images/readme/menu.png)  

- Enfin, des pièges et mécanismes ont été ajoutés des les différents niveaux afin de compléxifier et rendre plus intéressante l'expérience de jeu pour le joueur.  

![bouton](/public/images/readme/bouton.png)  

![trappe](/public/images/readme/pi%C3%A8ge.jpg)  

- Finalement voici à quoi ressemble le jeu actuellement:

![jeu](/public/images/readme/jeu.png)  


## Installation

Pour pouvoir jouer chez vous en local sur votre machine, il y a différentes étapes à suivre.

> 1. Clonez le dépôt GitHub.

> 2. Installez NodeJS et NPM.

> 3. Dans un terminal, ouvrez le dossier du dépôt.

> 4. Exécutez la commande ``` npm install```

> 5. Exécutez ensuite la commande ```npm start```

> 6. Exécutez ensuite la commande ```node app.js```

> 7. Dans votre navigateur, rendez vous à l'adresse ```http://localhost:3000/```

## Déploiement

Cette application a été déployé à l'aide de la plateforme de déploiement cloud 
[heroku](https://www.heroku.com/).  

## Ressources

> Le [playground](https://playground.babylonjs.com/) de BabylonJS a été une très grande source d'aide

> Le [forum](https://forum.babylonjs.com/) a aussi été utile.

> YouTube a été une très bonne source de tutoriels pour blender

> Les musiques ont été prises [ici](https://mixkit.co/free-sound-effects/game)

> Les modèles des labyrinthes ont entièrement été fait par nos soins.

> Les différentes textures nous viennet d'internet.

## Auteurs

- [@JulietteSabatier](https://github.com/JulietteSabatier)
- [@Ninjabsent](https://github.com/Ninjabsent)
- [@Yann-Brault](https://github.com/Yann-Brault)

