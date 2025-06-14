interface Resources {
  "translation": {
    "lobby": {
      "language": "Language",
      "player": "Player {{number}}",
      "addPlayer": "Add player",
      "difficulty": "Difficulty",
      "difficultyInfo": "Difficulty affects the total number of element cards that can be borrowed from the market throughout the game, not just in a single turn.",
      "advancedOptions": "Advanced Options",
      "useExpansionPack": "Use expansion pack",
      "seed": "Seed",
      "seedInfo": "The seed ensures a consistent game deck shuffle. Using the same seed will result in the same deck order each time.",
      "rulebook": "Game rules",
      "rulebook_filename": "string"
    },
    "deck": {
      "policies": {
        "drawMessage": {
          "implementation": "You drew a funding card that can\ncontribute towards the implementation of a measure!",
          "negative": "You drew a special card!",
          "dual": "You drew a special card!",
          "positive": "You drew a special measure card!",
          "positiveExtra": {
            "hasFunding": "You can implement it by spending one of your Funding cards.",
            "noFunding": "You can activate it once you have a Funding card."
          },
          "automaticDraw": {
            "habitat": "This card was automatically drawn after unlocking a habitat.",
            "extinction": "This card was automatically drawn after an extinction event."
          }
        },
        "funding": {
          "name": "Funding",
          "description": "This card must be paired with a measure card to allow the measure card to be implemented.",
          "eventDescription": "This card must be paired with a measure card to allow the measure card to be implemented."
        },
        "hazardousSubstanceRegulation": {
          "name": "Hazardous substance regulation",
          "description": "You can pair a producer and an animal sharing the same habitat symbol to secure a habitat-tile",
          "eventDescription": "Pre-emptive regulation of a group of hazardous substances significantly reduces their use, and their inputs to the Baltic Sea.",
          "pickProducerCommandBarText": "Pick a producer card that shares a habitat with an animal card",
          "pickAnimalCommandBarText": "Pick an animal card that shares a habitat with a producer card"
        },
        "wasteWaterTreatmentFailure": {
          "name": "Waste water treatment failure",
          "description": "Every player with at least one nutrient card in their hand takes a human activity card and places it in their hand.",
          "eventDescription": "Heavy rainfall causes a wastewater treatment plant to overflow, releasing nutrients into the sea."
        },
        "warmSummer": {
          "name": "Warm summer",
          "description": "If min. one measure has been implemented when this card is lifted, all players can activate all action-tokens. If no measures have been implemented all players need to deactivate all action-token.",
          "eventDescription": "Climate change results in a warm summer and the sea temperature increases, putting pressure on the ecosystem. To increase resilience other pressures need to be minimised. "
        },
        "climateChange": {
          "name": "Climate change",
          "description": "Each time a player gets an impact-tile an additional impact-tile is added to the impact tile puzzle.",
          "eventDescription": "CO₂ released from human activities results in changes to temperature, rainfall, wind speed and much more, putting additional pressure on the Baltic Sea ecosystem.",
          "stageEventText": "Because of climate change you get an additional extinction tile!"
        },
        "oilSpill": {
          "name": "Oil spill",
          "description": "Discard all birds open on the table (in players hands and in the market). Cards in hands are not replaced.",
          "eventDescription": "A shipping accident causes an oil spill which reaches land, impacting a Marine Protected Area (MPA). "
        },
        "hazardousIndustrialSubstances": {
          "name": "Hazardous substances from industry",
          "description": "Discard all producer cards on the table (in each players hands and in the market). Cards in hands are not replaced.",
          "eventDescription": "Releasing hazardous substances acutely affect plankton, cascading through the rest of the food web."
        },
        "overfishing": {
          "name": "Overfishing",
          "description": "Discard all fish open on the table (in players hands and in the market). Cards in hands are not replaced.",
          "eventDescription": "Scientific advice on fishing is ignored, subsequently unsustainable fishing occurs. The fish populations crash, causing ecosystem imbalance and low catches in the future."
        },
        "hunting": {
          "name": "Hunting",
          "description": "Permanently remove all mammals and birds in your hand from the game.",
          "eventDescription": "Persistent hunting results in large numbers of long-tailed ducks being killed during migration. The species' recovery is severely impacted and the species remains listed as Endangered."
        },
        "atmosphericDeposition": {
          "name": "Atmospheric deposition of hazardous substances",
          "description": "Remove Calanoida from the game, irrespective of where it is.",
          "eventDescription": "Hazardous substances like dioxins and mercury travel long distances through the atmosphere, affecting areas far beyond their origin, causing e.g. mutation and acute mortality."
        },
        "habitatRestoration": {
          "name": "Habitat restoration",
          "description": "You can remove one impact-tile from the impact tile-puzzle",
          "eventDescription": "Coastal habitat restoration results in vibrant wetlands and a clear increase in fish breeding success, as well as more resilient ecosystem."
        },
        "bubbleCurtains": {
          "name": "Bubble curtains",
          "description": "All players can restore all three of their ability tokens.",
          "eventDescription": "During underwater construction projects bubble curtains are used and the spread and level of underwater noise is lowered, minimising the pressure on noise sensitive species."
        },
        "nutrientUpwelling": {
          "name": "Nutrient upwelling and internal nutrient cycling",
          "description": "All players take turns (starting from the active player) to add up to two nutrient cards to their hand, or until the market is empty.",
          "eventDescription": "Internal cycling and upwelling of nutrients supports growth of producer, positively or negatively affecting the food web."
        },
        "excessiveFertilizerUse": {
          "name": "Excessive fertiliser use",
          "description": "Add two nutrient card to the active player's hand. If there are no more nutrient cards in the market, take a human activity card. Place all oxygen cards in all players hands back in the market.",
          "eventDescription": "Use of too much fertiliser in agriculture results in increased amounts of nutrients entering the sea."
        },
        "upgradedWasteWaterTreatment": {
          "name": "Upgraded waste water treatment",
          "description": "Take an additional nutrient card from the market or, if you have three nutrient cards in your hand, you can put one back in the market.",
          "eventDescription": "Investment to implement the latest technology in wastewater treatment  markedly reduces the release of nutrients to the sea."
        },
        "improvedNutrientRetention": {
          "name": "Improved nutrient retention in agriculture",
          "description": "All producer cards requires one nutrient less for the rest of the game.",
          "eventDescription": "Utilizing the best available technologies for fertilization reduces the risk of nutrients draining from agricultural to the sea."
        },
        "migratoryBarrierRemoval": {
          "name": "Migratory barrier removal",
          "description": "Take one fish or bird card from the market and add it to any players hand.",
          "eventDescription": "Removal of dams in rivers increases the movement and breeding success of migratory fish species.",
          "pickSpeciesCommandBarText": "Pick a fish or bird card from the market",
          "pickPlayerCommandBarText": "Pick a player's hand to move your chosen card to"
        },
        "fishingGearRegulation": {
          "name": "Fishing gear regulation",
          "description": "Add all cards in the market which have a mud symbol to any players hand.",
          "eventDescription": "Regulation and spatial distribution of fishing effort of bottom trawling allows for benthic habitats to recover.",
          "commandBarText": "Pick a player's hand to move all the mud species to"
        },
        "recyclingAndWasteDisposal": {
          "name": "Recycling and waste disposal",
          "description": "Remove two human activity cards from the hand(s) of any player(s) and replace the cards with cards from the player(s) deck(s).",
          "eventDescription": "Improved waste disposal and recycling, combined with lower production of single use plastic, reduces litter levels entering the sea.",
          "commandBarText": "Pick a disaster card to discard from any player's hand"
        },
        "greenEnergy": {
          "name": "Green energy",
          "description": "If coastal, hard- or soft bottom habitats have already been restored when this card is lifted, add an impact tile. If none of the above habitats have been restored prior to lifting this card, choose one of these habitats to immediately restore.",
          "eventDescription": "Green energy development at sea requires space, and the positive and/or negative effects on the ecosystem of the installations dependend directly on the quality and timelyness of the planning process.",
          "commandBarText": "Choose either the Rock or Mud habitat to unlock"
        },
        "underwaterNoise": {
          "name": "Underwater noise",
          "description": "The next player is not allowed to use abilities.",
          "eventDescription": "Intense shipping traffic causes too much noise under water, making it hard for fish and harbour porpoise to find food."
        },
        "beachLitter": {
          "name": "Beach litter",
          "description": "Skip the next player's turn. This card will be added as a litter to the drawing player's deck.",
          "eventDescription": "Poor facilities and behaviour result in litter entering the sea. Beaches become unpleasant, affecting locals and tourists alike."
        },
        "strictProtection": {
          "name": "Strict protection",
          "description": "Species cannot be discarded as a result of an action card.",
          "eventDescription": "Strict protection measures in Marine Protected Area (MPAs) leads to a boost in species abundances. Letting them spread also outside of the MPA.",
          "stageEventText": "Protection measures prevented the discarding of species",
          "protectionActivationText": "You have the opportunity to block effects with strict protection."
        }
      }
    },
    "stageEventText": {
      "congratulations": "Congratulations!",
      "earnedHabitat_one": "You earned the {{habitatText}} habitat",
      "earnedHabitat_other": "You earned the {{habitatText}} habitats",
      "boughtCard": "You bought a {{cardName}}",
      "disaster": "You did not buy anything.\nYou get a disaster card.",
      "extinction": "Too many disasters causes an extinction.\nYou get an extinction tile and your turn ends.",
      "massExtinction": "Too many disasters causes a mass extinction.\nYou get 3 extinction tiles and your turn ends.",
      "elementalDisaster": "Too many elements causes a disaster.\nYou get a disaster card and your turn ends.",
      "abilityRefreshed": "Your {{abilityName}} ability has been refreshed!",
      "canRefreshAbility": "You can now refresh one of your used abilities.",
      "gameWin": "Congratulations!\nYou saved the Baltic ecosystem!",
      "gameLoss": "Game Over!\nYou could not save the Baltic Ecosystem.",
      "abilityUseBlocked": "You cannot use your abilities right now.",
      "skipTurn": "You will have to wait for the next turn."
    },
    "policies": {
      "active": "Active Policies",
      "acquired": "Acquired Policies",
      "funding": "Funding",
      "activate": "Activate"
    },
    "blocker": {
      "leavePageMessage": "Are you sure you want to leave this page?"
    },
    "buttons": {
      "showCards": "Show cards",
      "endTurn": "End Turn",
      "newGame": "New game",
      "ok": "Ok",
      "play": "Play!"
    },
    "abilities": {
      "commandBar": {
        "move": {
          "pickCard": "Pick a card from your hand to move",
          "pickDestination": "Pick a destination to move your chosen card to",
          "pickDestinationSinglePlayer": "Pick a destination to move your chosen card to, picking your own deck will make the card available for use in your next turn."
        },
        "refresh": {
          "pickMarket": "Pick a market to refresh"
        }
      }
    },
    "commandBar": {
      "backToStageEvent": "Click here to go back to the event"
    }
  }
}

export default Resources;
