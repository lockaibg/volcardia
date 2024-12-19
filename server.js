const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();

// Le parseur JSON n'est pas nécessaire pour ce endpoint car on utilise multer pour form-data,
// mais on peut le garder si d'autres endpoints l'utilisent.
app.use(express.json()); 

app.get('/cards.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'cards.json'));
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, 'public/illustrationCartes/');
  },
  filename: function (req, file, cb) {
      // Conservez le nom d'origine et ajoutez l'extension ".png"
      const originalName = file.originalname.split('.')[0]; // Supprimer l'extension originale
      cb(null, `${originalName}-${Date.now()}.png`);
  }
});

const upload = multer({ storage: storage });

// Servir les fichiers statiques (HTML, CSS, JS) depuis le dossier public
app.use(express.static(path.join(__dirname, 'public')));

// Route pour ajouter une nouvelle carte
app.post('/add-card', upload.single('card-image'), (req, res) => {
  const { nom, effet, type, energie, attaque, defense, fond, replace } = req.body;

  // Validation des champs obligatoires
  // On considère : nom, effet, type, energie obligatoires
  if (!nom || !type || energie === undefined) {
    return res.status(400).json({ 
      error: "Les champs nom, type et energie sont obligatoires." 
    });
  }

  // Convertir energie, attaque, defense en nombres
  const energieNum = parseInt(energie, 10);
  const attaqueNum = parseInt(attaque, 10);
  const defenseNum = parseInt(defense, 10);

  if (isNaN(energieNum)) {
    return res.status(400).json({ 
      error: "Le champ energie doit être un nombre." 
    });
  }

  // Déterminer le chemin de l'illustration
  let imagePath = "";
  if (req.file && req.file.filename) {
    imagePath = "illustrationCartes/" + req.file.filename;
  }

  // Lecture du JSON existant
  const cardsPath = path.join(__dirname, 'cards.json');
  let cardsData = [];
  if (fs.existsSync(cardsPath)) {
    const fileContent = fs.readFileSync(cardsPath, 'utf8');
    cardsData = JSON.parse(fileContent);
  }
  // Création de l'objet carte
  let newCard = {
    source_illustration: imagePath,
    nom: nom.trim(),
    effet: effet.trim(),
    type: type.trim(),
    energie: energieNum,
    fond: fond
  };
if (replace === 'true') {
  newCard = {
    source_illustration: cardsData.find(c => c.nom.toLowerCase() === nom.toLowerCase()).source_illustration,
    nom: nom.trim(),
    effet: effet.trim(),
    type: type.trim(),
    energie: energieNum,
    fond: fond
  };
}

  // Attaque et défense uniquement si c'est des nombres valides
  if (!isNaN(attaqueNum)) {
    newCard.attaque = attaqueNum;
  }
  if (!isNaN(defenseNum)) {
    newCard.defense = defenseNum;
  }
  if (replace === 'true') {
    cardsData = cardsData.filter(c => c.nom.toLowerCase() !== nom.toLowerCase());
  }
  // Ajout de la nouvelle carte au tableau
  cardsData.push(newCard);

  // Écriture du nouveau JSON
  fs.writeFileSync(cardsPath, JSON.stringify(cardsData, null, 2), 'utf8');

  res.json({ message: "La carte a été ajoutée avec succès !", card: newCard });
});

// Démarrage du serveur
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});