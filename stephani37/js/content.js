// ============================================================
//  EDIT ME — all party content lives here. No logic.
// ============================================================
window.PARTY = {
  guestOfHonor: 'Stephani',

  intro: {
    welcome: 'WELCOME TO',
    name: "BABY GIRL'S",
    number: '37',
    suffix: 'th',
    tagline: 'BIRTHDAY PARTY'
  },

  wifi: {
    ssid: 'BabyPenguin',
    password: 'sanjosewaco713'
  },

  music: {
    // Drop your entrance theme here (mp3 or m4a). Loops forever.
    src: 'assets/audio/theme.mp3',
    startAt: 0,            // seconds — skip a slow intro and hit the drop
    introVolume: 1.0,      // 0.0 – 1.0
    homeVolume: 0.35,      // volume ducks to this on the home hub
    keepPlayingOnHome: true
  },

  modules: [
    { id: 'gallery',   title: 'Photo Gallery',   blurb: 'Browse all photos & zoom in full-screen' },
    { id: 'quiz',      title: 'Stephani Quiz',   blurb: 'How well do you know the Birthday Girl?' },
    { id: 'drinks',    title: 'Drink Recipes',   blurb: '36 Pink Lady Apple Cider cocktails to mix' }
  ],

  // Stephani Trivia Quiz Questions & Options
  quiz: [
    {
      question: "What is Stephani's favorite NHL team?",
      options: [
        "San Jose Sharks",
        "Vegas Golden Knights",
        "Anaheim Ducks",
        "Los Angeles Kings"
      ],
      correctIndex: 0
    },
    {
      question: "What is Stephani's ring finger size?",
      options: [
        "7.0",
        "7.5",
        "8.0",
        "8.5"
      ],
      correctIndex: 3
    },
    {
      question: "What does Stephani want for breakfast besides breakfast items?",
      options: [
        "Tacos or pizza",
        "Only breakfast items!",
        "A fresh salad",
        "Leftovers from dinner"
      ],
      correctIndex: 1
    },
    {
      question: "What is Stephani's favorite MLB team?",
      options: [
        "Oakland Athletics",
        "Los Angeles Dodgers",
        "San Francisco Giants",
        "San Diego Padres"
      ],
      correctIndex: 2
    },
    {
      question: "Stephani is half ___ and half ___:",
      options: [
        "Italian & Portuguese",
        "Italian & Irish",
        "Italian & Greek",
        "Italian & Spanish"
      ],
      correctIndex: 0
    }
  ],

  // 36 Pink Lady Apple Cider Cocktail Recipes
  drinks: [
      {
          "title": "Pink Lady Pantry Buck",
          "category": "Your original six",
          "spirit": "Bourbon or dark rum",
          "style": "Apple, ginger, cinnamon, bright acidity",
          "time": "5 minutes",
          "extra": "Uses all six ingredients you listed.",
          "ingredients": [
              "1½ oz bourbon or dark rum",
              "3 oz Pink Lady apple cider",
              "1 teaspoon apple cider vinegar",
              "1 teaspoon ready-to-use lemon juice",
              "1 teaspoon ready-to-use lime juice",
              "2 oz chilled ginger ale",
              "1 tiny pinch ground cinnamon, about 1/32 teaspoon",
              "Ice"
          ],
          "method": [
              "Add the spirit, cider, vinegar, lemon juice, lime juice, and cinnamon to a shaker or lidded jar.",
              "Add ice and shake for about 10 seconds.",
              "Strain into a tall glass filled with fresh ice.",
              "Top with ginger ale and stir gently once or twice."
          ],
          "adjust": "If the cider is already tart, start with ½ teaspoon vinegar. Add the remainder only after tasting."
      },
      {
          "title": "Cinnamon Bourbon Cider Sour",
          "category": "Your original six",
          "spirit": "Bourbon",
          "style": "Short, tart, lightly spiced",
          "time": "5 minutes",
          "extra": "",
          "ingredients": [
              "1½ oz bourbon",
              "2 oz Pink Lady apple cider",
              "½ oz ready-to-use lemon juice",
              "1 tiny pinch ground cinnamon, about 1/32 teaspoon",
              "Optional: 1 teaspoon maple syrup or simple syrup",
              "Ice"
          ],
          "method": [
              "Add bourbon, cider, lemon juice, and cinnamon to a shaker.",
              "Add ice and shake for 10–15 seconds.",
              "Strain into a rocks glass over fresh ice.",
              "Taste and stir in the optional syrup if needed."
          ],
          "adjust": "Start with ¼ oz lemon juice if your cider is notably tart."
      },
      {
          "title": "Apple-Ginger Rum Highball",
          "category": "Your original six",
          "spirit": "Dark or aged rum",
          "style": "Easy, bubbly, apple-forward",
          "time": "3 minutes",
          "extra": "",
          "ingredients": [
              "1½ oz dark or aged rum",
              "3 oz Pink Lady apple cider",
              "¼ oz ready-to-use lime juice",
              "2 oz chilled ginger ale",
              "Ice"
          ],
          "method": [
              "Fill a tall glass with ice.",
              "Add rum, cider, and lime juice; stir briefly.",
              "Top with ginger ale and stir gently."
          ],
          "adjust": "For more citrus bite, add another ¼ oz lime juice after tasting."
      },
      {
          "title": "Tart Apple Vodka Shrub Fizz",
          "category": "Your original six",
          "spirit": "Vodka",
          "style": "Crisp, tangy, gently gingery",
          "time": "3 minutes",
          "extra": "",
          "ingredients": [
              "1½ oz vodka",
              "3 oz Pink Lady apple cider",
              "1 teaspoon apple cider vinegar",
              "¼ oz ready-to-use lemon juice",
              "2 oz chilled ginger ale",
              "Ice"
          ],
          "method": [
              "Fill a tall glass with ice.",
              "Add vodka, cider, vinegar, and lemon juice.",
              "Stir, then top with ginger ale.",
              "Stir gently once more."
          ],
          "adjust": "Start with ½ teaspoon vinegar for a softer tang. This is a quick shrub-style drink; no separate vinegar syrup is required."
      },
      {
          "title": "Tequila Cider Ginger Cooler",
          "category": "Your original six",
          "spirit": "Blanco or reposado tequila",
          "style": "Apple, lime, lively ginger",
          "time": "3 minutes",
          "extra": "",
          "ingredients": [
              "1½ oz tequila",
              "3 oz Pink Lady apple cider",
              "½ oz ready-to-use lime juice",
              "2 oz chilled ginger ale",
              "Optional: 1 tiny pinch ground cinnamon, about 1/32 teaspoon",
              "Ice"
          ],
          "method": [
              "Add tequila, cider, lime juice, and optional cinnamon to a tall glass.",
              "Stir well, then fill with ice.",
              "Top with ginger ale and stir gently."
          ],
          "adjust": "Use ¼ oz lime juice initially if your cider is tart. Reposado adds a warmer oak note; blanco keeps the drink brighter."
      },
      {
          "title": "Warm Cinnamon Cider Toddy",
          "category": "Your original six",
          "spirit": "Brandy or bourbon",
          "style": "Warm apple, cinnamon, lemon",
          "time": "10 minutes",
          "extra": "",
          "ingredients": [
              "1½ oz brandy or bourbon",
              "5 oz Pink Lady apple cider",
              "¼ oz ready-to-use lemon juice",
              "1 cinnamon stick, or 1 tiny pinch ground cinnamon, about 1/32 teaspoon",
              "Optional: ½ teaspoon apple cider vinegar",
              "Optional: 1 teaspoon honey or maple syrup"
          ],
          "method": [
              "Heat the cider and cinnamon gently in a small saucepan for about 5 minutes, until steaming.",
              "Remove from the heat. Remove the cinnamon stick if using.",
              "Pour into a heatproof mug and stir in the spirit and lemon juice.",
              "Add the optional vinegar for extra tang or the optional sweetener to soften the acidity."
          ],
          "adjust": "If using ground cinnamon, whisk it into the cider before heating."
      },
      {
          "title": "Maple Rye Cider Sour",
          "category": "Whiskey",
          "spirit": "Rye whiskey",
          "style": "Tart apple, peppery rye, maple",
          "time": "5 minutes",
          "extra": "Additional items beyond your six pantry ingredients and the base spirit: Maple syrup.",
          "ingredients": [
              "1½ oz rye whiskey",
              "2 oz Pink Lady apple cider",
              "½ oz ready-to-use lemon juice",
              "¼ oz maple syrup",
              "Ice"
          ],
          "method": [
              "Shake all liquid ingredients with ice for 10–15 seconds.",
              "Strain into a rocks glass over fresh ice."
          ],
          "adjust": ""
      },
      {
          "title": "Honey-Mint Bourbon Apple Smash",
          "category": "Whiskey",
          "spirit": "Bourbon",
          "style": "Minty apple with rounded honey sweetness",
          "time": "5 minutes",
          "extra": "Additional items beyond your six pantry ingredients and the base spirit: Fresh mint and honey.",
          "ingredients": [
              "1½ oz bourbon",
              "2 oz Pink Lady apple cider",
              "½ oz ready-to-use lemon juice",
              "1 teaspoon honey",
              "1 teaspoon warm water",
              "6 fresh mint leaves",
              "Ice"
          ],
          "method": [
              "Stir honey with warm water until dissolved; cool briefly.",
              "Gently press the mint with the lemon juice in a shaker.",
              "Add bourbon, cider, honey mixture, and ice; shake for 10 seconds.",
              "Strain through a fine strainer into a rocks glass over fresh ice."
          ],
          "adjust": ""
      },
      {
          "title": "Cinnamon Apple Old Fashioned",
          "category": "Whiskey",
          "spirit": "Bourbon",
          "style": "Spirit-forward, concentrated apple and bitters",
          "time": "20 minutes including reduction and cooling",
          "extra": "Additional items beyond your six pantry ingredients and the base spirit: Aromatic bitters and an optional orange peel.",
          "ingredients": [
              "2 oz bourbon",
              "½ oz cooled cider reduction, prepared below",
              "2 dashes aromatic bitters",
              "1 tiny pinch ground cinnamon, about 1/32 teaspoon",
              "Ice",
              "Optional garnish: orange peel"
          ],
          "method": [
              "For the reduction, gently simmer ½ cup Pink Lady apple cider until reduced to ¼ cup. Cool completely. This makes enough reduction for four drinks.",
              "Stir bourbon, ½ oz cider reduction, bitters, and cinnamon with ice for 20–30 seconds.",
              "Strain into a rocks glass over a large ice cube; add optional orange peel."
          ],
          "adjust": ""
      },
      {
          "title": "Apple Harvest Manhattan",
          "category": "Whiskey",
          "spirit": "Rye whiskey",
          "style": "Vermouth, spice, and mellow apple",
          "time": "5 minutes",
          "extra": "Additional items beyond your six pantry ingredients and the base spirit: Sweet vermouth and aromatic bitters.",
          "ingredients": [
              "1½ oz rye whiskey",
              "¾ oz sweet vermouth",
              "¾ oz Pink Lady apple cider",
              "2 dashes aromatic bitters",
              "Ice"
          ],
          "method": [
              "Combine all ingredients in a mixing glass with ice.",
              "Stir for 25–30 seconds.",
              "Strain into a chilled small cocktail glass."
          ],
          "adjust": ""
      },
      {
          "title": "Bourbon Apple Black Tea Punch",
          "category": "Whiskey",
          "spirit": "Bourbon",
          "style": "Tea tannin, ginger, and lemon",
          "time": "5 minutes with tea already chilled",
          "extra": "Additional items beyond your six pantry ingredients and the base spirit: Brewed black tea.",
          "ingredients": [
              "1½ oz bourbon",
              "2 oz Pink Lady apple cider",
              "2 oz brewed black tea, chilled",
              "¼ oz ready-to-use lemon juice",
              "1 oz chilled ginger ale",
              "Ice"
          ],
          "method": [
              "Fill a tall glass with ice.",
              "Add bourbon, cider, chilled tea, and lemon juice; stir.",
              "Top with ginger ale and stir gently."
          ],
          "adjust": ""
      },
      {
          "title": "Pink Lady Cider Daiquiri",
          "category": "Rum",
          "spirit": "White rum",
          "style": "Clean apple and lime, served up",
          "time": "5 minutes",
          "extra": "Additional items beyond your six pantry ingredients and the base spirit: Optional simple syrup.",
          "ingredients": [
              "1½ oz white rum",
              "1½ oz Pink Lady apple cider",
              "½ oz ready-to-use lime juice",
              "Optional: 1 teaspoon simple syrup",
              "Ice"
          ],
          "method": [
              "Shake rum, cider, and lime juice with ice for 10–15 seconds.",
              "Strain into a chilled small cocktail glass.",
              "If needed, stir in the optional syrup."
          ],
          "adjust": ""
      },
      {
          "title": "Pineapple Apple Rum Cooler",
          "category": "Rum",
          "spirit": "Aged rum",
          "style": "Tropical pineapple with tart apple",
          "time": "5 minutes",
          "extra": "Additional items beyond your six pantry ingredients and the base spirit: Pineapple juice.",
          "ingredients": [
              "1½ oz aged rum",
              "2 oz Pink Lady apple cider",
              "1½ oz pineapple juice",
              "½ oz ready-to-use lime juice",
              "1 oz chilled ginger ale",
              "Ice"
          ],
          "method": [
              "Shake rum, cider, pineapple juice, and lime juice with ice.",
              "Strain into a tall glass over fresh ice.",
              "Add ginger ale and stir gently."
          ],
          "adjust": ""
      },
      {
          "title": "Frozen Coconut Apple Colada",
          "category": "Rum",
          "spirit": "White rum",
          "style": "Creamy coconut, apple, and lime",
          "time": "5 minutes",
          "extra": "Additional items beyond your six pantry ingredients and the base spirit: Canned unsweetened coconut milk and sweetened cream of coconut.",
          "ingredients": [
              "1½ oz white rum",
              "2 oz Pink Lady apple cider",
              "1 oz canned unsweetened coconut milk, stirred smooth",
              "½ oz sweetened cream of coconut",
              "¼ oz ready-to-use lime juice",
              "¾ cup ice"
          ],
          "method": [
              "Add all ingredients to a blender.",
              "Blend until smooth and pour into a large glass.",
              "If too thick to pour, blend in ½ oz additional cider."
          ],
          "adjust": ""
      },
      {
          "title": "Apple Mint Mojito-Style Cooler",
          "category": "Rum",
          "spirit": "White rum",
          "style": "Fresh mint, lime, apple, and gentle bubbles",
          "time": "5 minutes",
          "extra": "Additional items beyond your six pantry ingredients and the base spirit: Fresh mint and club soda.",
          "ingredients": [
              "1½ oz white rum",
              "2½ oz Pink Lady apple cider",
              "½ oz ready-to-use lime juice",
              "8 fresh mint leaves",
              "2 oz chilled club soda",
              "Ice"
          ],
          "method": [
              "Gently press mint with lime juice in the bottom of a tall glass.",
              "Add rum and cider; stir.",
              "Fill with ice, top with club soda, and stir gently."
          ],
          "adjust": ""
      },
      {
          "title": "Hot Buttered Apple Rum",
          "category": "Rum",
          "spirit": "Dark rum",
          "style": "Warm apple pie, butter, and brown sugar",
          "time": "10 minutes",
          "extra": "Additional items beyond your six pantry ingredients and the base spirit: Unsalted butter and brown sugar.",
          "ingredients": [
              "1½ oz dark rum",
              "5 oz Pink Lady apple cider",
              "1 teaspoon unsalted butter, softened",
              "1 teaspoon brown sugar",
              "1 tiny pinch ground cinnamon, about 1/32 teaspoon"
          ],
          "method": [
              "In a heatproof mug, mash the butter, brown sugar, and cinnamon together.",
              "Gently heat cider in a saucepan until steaming.",
              "Slowly stir hot cider into the butter mixture until combined.",
              "Stir in rum and serve warm."
          ],
          "adjust": ""
      },
      {
          "title": "Rosemary Gin Apple Collins",
          "category": "Gin & vodka",
          "spirit": "Gin",
          "style": "Herbal, lemony, and sparkling",
          "time": "5 minutes",
          "extra": "Additional items beyond your six pantry ingredients and the base spirit: Fresh rosemary and club soda.",
          "ingredients": [
              "1½ oz gin",
              "2½ oz Pink Lady apple cider",
              "½ oz ready-to-use lemon juice",
              "1 small rosemary sprig, about 2 inches",
              "2 oz chilled club soda",
              "Ice"
          ],
          "method": [
              "Gently press rosemary with lemon juice in a shaker.",
              "Add gin, cider, and ice; shake for 10 seconds.",
              "Fine-strain into a tall glass over fresh ice.",
              "Top with club soda and stir gently."
          ],
          "adjust": ""
      },
      {
          "title": "Basil Apple Gin Sour",
          "category": "Gin & vodka",
          "spirit": "Gin",
          "style": "Fragrant basil with crisp lemon and apple",
          "time": "5 minutes",
          "extra": "Additional items beyond your six pantry ingredients and the base spirit: Fresh basil and optional simple syrup.",
          "ingredients": [
              "1½ oz gin",
              "2 oz Pink Lady apple cider",
              "½ oz ready-to-use lemon juice",
              "4 fresh basil leaves",
              "Optional: 1 teaspoon simple syrup",
              "Ice"
          ],
          "method": [
              "Gently press basil with lemon juice in a shaker.",
              "Add gin, cider, optional syrup, and ice.",
              "Shake for 10–15 seconds and fine-strain into a chilled cocktail glass."
          ],
          "adjust": ""
      },
      {
          "title": "Cucumber Apple Gin Fizz",
          "category": "Gin & vodka",
          "spirit": "Gin",
          "style": "Cool cucumber, tart apple, and ginger",
          "time": "5 minutes",
          "extra": "Additional items beyond your six pantry ingredients and the base spirit: Cucumber.",
          "ingredients": [
              "1½ oz gin",
              "2 oz Pink Lady apple cider",
              "¼ oz ready-to-use lime juice",
              "½ teaspoon apple cider vinegar",
              "3 cucumber slices, about ¼ inch thick",
              "2 oz chilled ginger ale",
              "Ice"
          ],
          "method": [
              "Muddle cucumber slices with lime juice in a shaker.",
              "Add gin, cider, vinegar, and ice; shake for 10 seconds.",
              "Fine-strain into a tall glass filled with fresh ice.",
              "Top with ginger ale and stir gently."
          ],
          "adjust": ""
      },
      {
          "title": "Cranberry Apple Vodka Cooler",
          "category": "Gin & vodka",
          "spirit": "Vodka",
          "style": "Tart cranberry, apple, and lemon",
          "time": "3 minutes",
          "extra": "Additional items beyond your six pantry ingredients and the base spirit: 100% unsweetened cranberry juice.",
          "ingredients": [
              "1½ oz vodka",
              "3 oz Pink Lady apple cider",
              "½ oz 100% unsweetened cranberry juice",
              "¼ oz ready-to-use lemon juice",
              "2 oz chilled ginger ale",
              "Ice"
          ],
          "method": [
              "Fill a tall glass with ice.",
              "Add vodka, cider, cranberry juice, and lemon juice; stir.",
              "Top with ginger ale and stir gently."
          ],
          "adjust": ""
      },
      {
          "title": "Caramel Apple Vodka Shake-Up",
          "category": "Gin & vodka",
          "spirit": "Vodka",
          "style": "Dessert-like apple, caramel, and cinnamon",
          "time": "5 minutes",
          "extra": "Additional items beyond your six pantry ingredients and the base spirit: Caramel sauce.",
          "ingredients": [
              "1½ oz vodka",
              "3 oz Pink Lady apple cider",
              "1 teaspoon caramel sauce",
              "1 teaspoon ready-to-use lemon juice",
              "1 tiny pinch ground cinnamon, about 1/32 teaspoon",
              "Ice"
          ],
          "method": [
              "In a shaker, stir caramel sauce into ½ oz of the measured cider until loosened.",
              "Add vodka, remaining cider, lemon juice, cinnamon, and ice.",
              "Shake vigorously for 15 seconds and strain over fresh ice in a rocks glass."
          ],
          "adjust": ""
      },
      {
          "title": "Pink Lady Cider Margarita",
          "category": "Tequila & mezcal",
          "spirit": "Blanco tequila",
          "style": "Apple, orange liqueur, and lime",
          "time": "5 minutes",
          "extra": "Additional items beyond your six pantry ingredients and the base spirit: Orange liqueur and optional salt.",
          "ingredients": [
              "1½ oz blanco tequila",
              "2 oz Pink Lady apple cider",
              "½ oz orange liqueur",
              "½ oz ready-to-use lime juice",
              "Ice",
              "Optional: pinch of salt for half the rim"
          ],
          "method": [
              "If desired, dampen half the glass rim with a little lime juice and dip it in salt.",
              "Shake tequila, cider, orange liqueur, and lime juice with ice.",
              "Strain into the glass over fresh ice."
          ],
          "adjust": ""
      },
      {
          "title": "Smoky Cinnamon Apple Sour",
          "category": "Tequila & mezcal",
          "spirit": "Mezcal",
          "style": "Smoky apple with lemon and warm spice",
          "time": "5 minutes",
          "extra": "Additional items beyond your six pantry ingredients and the base spirit: Agave syrup.",
          "ingredients": [
              "1½ oz mezcal",
              "2 oz Pink Lady apple cider",
              "½ oz ready-to-use lemon juice",
              "1 teaspoon agave syrup",
              "1 tiny pinch ground cinnamon, about 1/32 teaspoon",
              "Ice"
          ],
          "method": [
              "Shake all liquid ingredients and cinnamon with ice for 10–15 seconds.",
              "Strain into a rocks glass over fresh ice."
          ],
          "adjust": ""
      },
      {
          "title": "Jalapeño Apple Tequila Buck",
          "category": "Tequila & mezcal",
          "spirit": "Reposado tequila",
          "style": "Apple, ginger, and adjustable chile heat",
          "time": "5 minutes",
          "extra": "Additional items beyond your six pantry ingredients and the base spirit: Fresh jalapeño.",
          "ingredients": [
              "1½ oz reposado tequila",
              "3 oz Pink Lady apple cider",
              "¼ oz ready-to-use lime juice",
              "1 thin jalapeño slice, about ⅛ inch thick",
              "2 oz chilled ginger ale",
              "Ice"
          ],
          "method": [
              "Press the jalapeño slice once or twice with the lime juice in a shaker.",
              "Add tequila, cider, and ice; shake briefly.",
              "Fine-strain into a tall glass over fresh ice.",
              "Add ginger ale and stir gently."
          ],
          "adjust": ""
      },
      {
          "title": "Grapefruit Apple Paloma-Style Cooler",
          "category": "Tequila & mezcal",
          "spirit": "Blanco tequila",
          "style": "Bittersweet grapefruit with apple and lime",
          "time": "3 minutes",
          "extra": "Additional items beyond your six pantry ingredients and the base spirit: Grapefruit juice, club soda, and salt.",
          "ingredients": [
              "1½ oz blanco tequila",
              "2 oz Pink Lady apple cider",
              "1½ oz grapefruit juice",
              "¼ oz ready-to-use lime juice",
              "1½ oz chilled club soda",
              "1 small pinch salt",
              "Ice"
          ],
          "method": [
              "Fill a tall glass with ice.",
              "Add tequila, cider, grapefruit juice, lime juice, and salt; stir.",
              "Top with club soda and stir gently."
          ],
          "adjust": ""
      },
      {
          "title": "Honey Mezcal Apple Shrub",
          "category": "Tequila & mezcal",
          "spirit": "Mezcal",
          "style": "Smoky, honeyed, and vinegar-tart",
          "time": "5 minutes",
          "extra": "Additional items beyond your six pantry ingredients and the base spirit: Honey and club soda.",
          "ingredients": [
              "1½ oz mezcal",
              "3 oz Pink Lady apple cider",
              "1 teaspoon apple cider vinegar",
              "1 teaspoon honey",
              "1 teaspoon warm water",
              "1½ oz chilled club soda",
              "Ice"
          ],
          "method": [
              "Dissolve honey in warm water and let cool briefly.",
              "Stir the honey mixture, mezcal, cider, and vinegar in a tall glass.",
              "Fill with ice and top with club soda; stir gently."
          ],
          "adjust": ""
      },
      {
          "title": "Apple Cider Sidecar",
          "category": "Brandy & liqueurs",
          "spirit": "Brandy",
          "style": "Orange, lemon, and rounded apple",
          "time": "5 minutes",
          "extra": "Additional items beyond your six pantry ingredients and the base spirit: Orange liqueur.",
          "ingredients": [
              "1½ oz brandy",
              "½ oz orange liqueur",
              "1½ oz Pink Lady apple cider",
              "½ oz ready-to-use lemon juice",
              "Ice"
          ],
          "method": [
              "Shake all ingredients with ice for 10–15 seconds.",
              "Strain into a chilled small cocktail glass."
          ],
          "adjust": ""
      },
      {
          "title": "Amaretto Apple Sour",
          "category": "Brandy & liqueurs",
          "spirit": "Amaretto and bourbon",
          "style": "Almond, apple, and tart lemon",
          "time": "5 minutes",
          "extra": "Additional items beyond your six pantry ingredients and the base spirit: Amaretto.",
          "ingredients": [
              "1 oz amaretto",
              "½ oz bourbon",
              "2 oz Pink Lady apple cider",
              "¾ oz ready-to-use lemon juice",
              "Ice"
          ],
          "method": [
              "Shake all ingredients with ice for 10–15 seconds.",
              "Strain into a rocks glass over fresh ice."
          ],
          "adjust": ""
      },
      {
          "title": "Pear Brandy Apple Ginger Fizz",
          "category": "Brandy & liqueurs",
          "spirit": "Unsweetened pear brandy",
          "style": "Fragrant pear, crisp apple, and ginger",
          "time": "3 minutes",
          "extra": "Additional items beyond your six pantry ingredients and the base spirit: Unsweetened pear brandy.",
          "ingredients": [
              "1½ oz unsweetened pear brandy or pear eau-de-vie",
              "3 oz Pink Lady apple cider",
              "¼ oz ready-to-use lemon juice",
              "2 oz chilled ginger ale",
              "Ice"
          ],
          "method": [
              "Fill a tall glass with ice.",
              "Add pear brandy, cider, and lemon juice; stir.",
              "Top with ginger ale and stir gently."
          ],
          "adjust": ""
      },
      {
          "title": "Spiced Orange Brandy Apple Cup",
          "category": "Brandy & liqueurs",
          "spirit": "Brandy",
          "style": "Orange, cinnamon, and mellow apple",
          "time": "5 minutes",
          "extra": "Additional items beyond your six pantry ingredients and the base spirit: Orange juice.",
          "ingredients": [
              "1½ oz brandy",
              "2 oz Pink Lady apple cider",
              "1 oz orange juice",
              "¼ oz ready-to-use lemon juice",
              "1 tiny pinch ground cinnamon, about 1/32 teaspoon",
              "Ice"
          ],
          "method": [
              "Shake all ingredients with ice for 10–15 seconds.",
              "Strain into a rocks glass filled with fresh ice."
          ],
          "adjust": ""
      },
      {
          "title": "Pomegranate Apple Brandy Cooler",
          "category": "Brandy & liqueurs",
          "spirit": "Brandy",
          "style": "Tart red fruit, apple, and ginger",
          "time": "3 minutes",
          "extra": "Additional items beyond your six pantry ingredients and the base spirit: Pomegranate juice.",
          "ingredients": [
              "1½ oz brandy",
              "2 oz Pink Lady apple cider",
              "1 oz unsweetened pomegranate juice",
              "¼ oz ready-to-use lime juice",
              "1½ oz chilled ginger ale",
              "Ice"
          ],
          "method": [
              "Fill a tall glass with ice.",
              "Add brandy, cider, pomegranate juice, and lime juice; stir.",
              "Top with ginger ale and stir gently."
          ],
          "adjust": ""
      },
      {
          "title": "Pink Lady Prosecco Spritz",
          "category": "Wine & aperitifs",
          "spirit": "Prosecco",
          "style": "Light apple bubbles with a lemon accent",
          "time": "3 minutes",
          "extra": "Additional items beyond your six pantry ingredients and the base spirit: Dry Prosecco.",
          "ingredients": [
              "3 oz chilled dry Prosecco",
              "2 oz chilled Pink Lady apple cider",
              "1 teaspoon ready-to-use lemon juice",
              "1 oz chilled ginger ale",
              "Ice"
          ],
          "method": [
              "Add ice, cider, and lemon juice to a large wine glass.",
              "Slowly add Prosecco and ginger ale.",
              "Stir once, gently."
          ],
          "adjust": ""
      },
      {
          "title": "Single-Glass Red Apple Sangria",
          "category": "Wine & aperitifs",
          "spirit": "Red wine and brandy",
          "style": "Red fruit, cinnamon, orange, and apple",
          "time": "15 minutes including a short rest",
          "extra": "Additional items beyond your six pantry ingredients and the base spirit: Dry red wine, brandy, orange juice, and optional apple slices.",
          "ingredients": [
              "3 oz dry red wine",
              "½ oz brandy",
              "2 oz Pink Lady apple cider",
              "½ oz orange juice",
              "1 tiny pinch ground cinnamon, about 1/32 teaspoon",
              "1 oz chilled ginger ale",
              "Ice",
              "Optional: 2 thin apple slices"
          ],
          "method": [
              "Stir wine, brandy, cider, orange juice, cinnamon, and optional apple slices together.",
              "Let rest in the refrigerator for 10 minutes.",
              "Add ice and ginger ale; stir gently."
          ],
          "adjust": ""
      },
      {
          "title": "White Wine Apple Ginger Cup",
          "category": "Wine & aperitifs",
          "spirit": "White wine",
          "style": "Crisp white wine, lime, apple, and ginger",
          "time": "3 minutes",
          "extra": "Additional items beyond your six pantry ingredients and the base spirit: Dry white wine and optional apple slices.",
          "ingredients": [
              "3 oz chilled dry white wine",
              "2 oz Pink Lady apple cider",
              "1 teaspoon ready-to-use lime juice",
              "1½ oz chilled ginger ale",
              "Ice",
              "Optional: 2 thin apple slices"
          ],
          "method": [
              "Add ice, wine, cider, and lime juice to a large wine glass.",
              "Add optional apple slices.",
              "Top with ginger ale and stir gently."
          ],
          "adjust": ""
      },
      {
          "title": "Apple Aperol Spritz",
          "category": "Wine & aperitifs",
          "spirit": "Aperol and Prosecco",
          "style": "Bittersweet orange with apple bubbles",
          "time": "3 minutes",
          "extra": "Additional items beyond your six pantry ingredients and the base spirit: Aperol, dry Prosecco, and club soda.",
          "ingredients": [
              "1 oz Aperol",
              "2 oz chilled dry Prosecco",
              "2 oz chilled Pink Lady apple cider",
              "1 oz chilled club soda",
              "Ice"
          ],
          "method": [
              "Fill a large wine glass with ice.",
              "Add Aperol and cider.",
              "Slowly add Prosecco and club soda; stir gently once."
          ],
          "adjust": ""
      },
      {
          "title": "Apple Sherry Cobbler",
          "category": "Wine & aperitifs",
          "spirit": "Amontillado sherry",
          "style": "Nutty, citrusy apple over crushed ice",
          "time": "5 minutes",
          "extra": "Additional items beyond your six pantry ingredients and the base spirit: Amontillado sherry and orange slices.",
          "ingredients": [
              "2½ oz amontillado sherry",
              "2 oz Pink Lady apple cider",
              "1 teaspoon ready-to-use lemon juice",
              "2 thin orange half-slices",
              "¾ cup crushed ice, plus more as needed"
          ],
          "method": [
              "Gently muddle orange slices with cider and lemon juice in a shaker.",
              "Add sherry and a handful of ice; shake briefly.",
              "Strain into a tall glass filled with crushed ice.",
              "Top with more crushed ice if needed."
          ],
          "adjust": ""
      }
  ],

  // Party timeline schedule displayed on intro overlay and menu corner
  timeline: [
    { time: '4:00 PM', event: 'Doors Open' },
    { time: '5:45 PM', event: 'Tacos Off The Grill' },
    { time: '7:00 PM', event: 'Birthday Cake' },
    { time: 'Later',   event: "Fire Pit & S'mores" }
  ],

  // High-Resolution Photo Gallery & Ambient Slideshow
  photos: [
    { src: 'assets/photos/stephani_1.jpg',   date: 'Birthday Smiles' },
    { src: 'assets/photos/stephani_2.jpg',   date: 'Casual Chic' },
    { src: 'assets/photos/stephani_3.jpg',   date: 'Sunshine Glow' },
    { src: 'assets/photos/stephani_4.jpg',   date: 'Stephani Radiance' },
    { src: 'assets/photos/stephani_5.jpg',   date: 'Party Vibes' },
    { src: 'assets/photos/stephani_6.jpg',   date: 'Golden Hour' },
    { src: 'assets/photos/stephani_7.jpg',   date: 'Celebration Moments' },
    { src: 'assets/photos/stephani_8.jpg',   date: 'Austin Outing' },
    { src: 'assets/photos/stephani_9.jpg',   date: 'Gorgeous Stephani' },
    { src: 'assets/photos/stephani_10.jpg',  date: 'Pure Happiness' },
    { src: 'assets/photos/stephani_11.jpg',  date: 'Birthday Girl • 37th' },
    { src: 'assets/photos/stephani_12.jpg',  date: 'Faire Day Elegance' },
    { src: 'assets/photos/stephani_13.jpg',  date: 'Festival Memories' },
    { src: 'assets/photos/stephani_14.jpg',  date: 'Adventures & Travels' },
    { src: 'assets/photos/stephani_22.jpg',  date: 'Sweet Moments' },
    { src: 'assets/photos/stephani_23.jpg',  date: 'Squad & Besties' }
  ],
  photoSlideshow: {
    intervalMs: 8000,    // Time between transitions (8 seconds)
    opacity: 0.32        // Subtle opacity so foreground UI remains crisp
  }
};
