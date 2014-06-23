xibase
======

plugin zibase pour SARAH de JP ENCAUSSE

Version 1.1

- Suppression du paramètre API_Version :
J'ai fait un mix entre ZAPI1 et ZAPI2.
Pour la génération de la grammaire et pour l'interrogation des sondes,
j'utilise l'API2.
Pour l'execution de commande, je suis resté sur l'API1 qui permet
notamment de Dimmer des lampes, ce que l'API2 ne permet plus.
Par ailleurs, l'ensemble des execution de commande (les
"allume","eteint","ouvre"...) se fait en local.
Il faut donc que la Zibase soit sur le même lan que SARAH.

- Amélioration du générateur de grammaire : Ajout des articles et
préposition sur les périphériques les plus courants.
Par exemple, si un périphérique est nommé "lumiere salon" ou "radiateur
chambre", les commandes automatiquement ajoutée par le plugin seront
"allume la lumière du salon", ou "allume le radiateur de la chambre".
De la même manière pour les sondes. Je recommande d'ailleurs de nommer
vos sondes "temp XX" pour les sondes temp-hydro et "light xx" pour les
sonde de luminosité.
Ainsi si vous avez une sonde "temp Cuisine", la commande générée
automatiquement sera "Comment est la température dans la cuisine".
Il ne vous restera normalement plus grand chose à modifier dans votre
grammaire.

Petit conseil : une fois les périphériques importés et la grammaire
ajustée à votre goût, faites une sauvegarde de votre ficher "xibase.xml"
ou supprimez la ligne "mets a jour la domotique"... cela peut vous
éviter de mauvaises surprises.

