import { default as CardComponent } from "./Card";
import Deck from "./Deck";
import { AnimalCard, Card, DisasterCard, ElementCard, PlantCard } from "@/state/types";
import { useThree } from "@react-three/fiber";
import { ColorManagement, SRGBColorSpace } from "three";
import { useGameState } from "@/context/game-state/hook";
import { keys } from "lodash-es";
import { AnimatePresence } from "framer-motion";
import React from "react";
import { TurnMachineGuards } from "@/state/machines/guards";
import Tile from "./Tile";
import PlayerTitle from "@/components/PlayerTitle";
import AbilityToken from "@/components/AbilityToken";
import Stage from "./Stage";
import EndTurnButton from "./EndTurnButton";

const Croupier = () => {
  const { state: gameState, uiState } = useGameState();
  const { emit, test, hasTag, guards } = useGameState();
  const { gl } = useThree();
  ColorManagement.enabled = true;
  gl.outputColorSpace = SRGBColorSpace;

  return (
    <AnimatePresence>
      {/* Market Cards */}
      {gameState.animalMarket.table.map((card: AnimalCard) => (
        <CardComponent
          key={card.uid}
          card={card}
          gamePieceAppearance={uiState.cardPositions[card.uid]}
          onClick={emit.marketCardClick(card)}
          isHighlighted={test.marketCardClick(card)}
        />
      ))}
      {gameState.plantMarket.table.map((card: PlantCard) => (
        <CardComponent
          key={card.uid}
          card={card}
          gamePieceAppearance={uiState.cardPositions[card.uid]}
          onClick={emit.marketCardClick(card)}
          isHighlighted={test.marketCardClick(card)}
        />
      ))}
      {gameState.disasterMarket.table.map((card: DisasterCard) => (
        <CardComponent
          key={card.uid}
          card={card}
          gamePieceAppearance={uiState.cardPositions[card.uid]}
          // onClick={emit.buyCard(card)}
        />
      ))}

      {keys(gameState.deck.elements)
        .map((name: string) => ({ name, cards: gameState.elementMarket.deck.filter((card) => card.name === name) }))
        .map(({ name, cards }: { name: string; cards: ElementCard[] }) => (
          <Deck
            key={name + "ElementDeck"}
            texturePath={`/ecosfera_baltica/element_${name}.avif`}
            textColor="black"
            gamePieceAppearance={uiState.deckPositions[`${name}ElementDeck`]}
            cards={cards}
            onClick={emit.marketElementClick(name)}
            isHighlighted={hasTag("usingAbility") && test.marketElementClick(name)}
          />
        ))}

      {gameState.turn.borrowedElement && (
        <CardComponent
          key={gameState.turn.borrowedElement.uid}
          card={gameState.turn.borrowedElement}
          gamePieceAppearance={uiState.cardPositions[gameState.turn.borrowedElement.uid]}
          onClick={emit.borrowedElementClick(gameState.turn.borrowedElement)}
          withFloatAnimation={true}
        />
      )}

      <Deck
        key={"animalDeck"}
        gamePieceAppearance={uiState.deckPositions["animalDeck"]}
        cards={gameState.animalMarket.deck}
        onClick={emit.animalDeckClick()}
        isHighlighted={test.animalDeckClick()}
      />
      <Deck
        key={"plantDeck"}
        gamePieceAppearance={uiState.deckPositions["plantDeck"]}
        cards={gameState.plantMarket.deck}
        onClick={emit.plantDeckClick()}
        isHighlighted={test.plantDeckClick()}
      />
      <Deck
        key={"disasterDeck"}
        gamePieceAppearance={uiState.deckPositions["disasterDeck"]}
        cards={gameState.disasterMarket.deck}
        onClick={() => console.error("Disaster deck click NOT IMPLEMENTED")}
      />

      {/* Player HUDs */}
      {gameState.players.map((player, playerIndex) => (
        <React.Fragment key={player.uid + "HUD"}>
          <Deck
            gamePieceAppearance={uiState.deckPositions[`${player.uid}PlayerDeck`]}
            cards={player.deck}
            onClick={emit.playerDeckClick()}
          />
          <PlayerTitle
            gamePieceAppearance={uiState.deckPositions[`${player.uid}PlayerDeck`]}
            offset={
              // TODO: use positioner for titles as well
              [
                [0, 10, 0],
                [0, 10, 0],
                [0, -13, 0],
                [0, 10, 0],
              ][playerIndex] as [number, number, number]
            }
            text={player.name}
          />
          {player.abilities.map((ability) => (
            <AbilityToken
              key={ability.uid}
              ability={ability}
              color={
                player.uid === gameState.turn.player &&
                (gameState.turn.selectedAbilityCard?.abilities.includes(ability.name) ||
                  (TurnMachineGuards.canRefreshAbility({ context: gameState }) && ability.isUsed))
                  ? "#1D86BC"
                  : undefined
              }
            />
          ))}
        </React.Fragment>
      ))}

      {/* Stage */}
      <Stage key="stage" />

      {/* Extinction tiles */}
      {[...gameState.extinctMarket.deck, ...gameState.extinctMarket.table].map((extinctionTile) => (
        <Tile
          key={extinctionTile.uid}
          tileUid={extinctionTile.uid}
          color={gameState.extinctMarket.deck.includes(extinctionTile) ? "#c3b091" : "#d17b79"}
        />
      ))}

      {/* Habitat tiles */}
      {gameState.habitatMarket.deck.map((habitatTile) => (
        <Tile
          key={habitatTile.uid}
          tileUid={habitatTile.uid}
          name={habitatTile.name}
          color={habitatTile.isAcquired ? "#2cba16" : "#66cc66"}
          withFloatAnimation={gameState.stage?.effect?.includes(habitatTile.uid)}
        />
      ))}

      {/* Player Discard */}
      {gameState.players.map(
        (player) =>
          player.discard.length > 0 && (
            <Deck
              gamePieceAppearance={{
                ...uiState.deckPositions[`${player.uid}PlayerDiscard`],
              }}
              cards={player.discard}
              key={player.uid + "PlayerDiscard"}
              onClick={() => console.error("discard click NOT IMPLEMENTED")}
            />
          ),
      )}

      {/* Player Cards */}
      {gameState.players.flatMap((player) =>
        player.hand.map(
          (card: Card) =>
            uiState.cardPositions[card.uid] && (
              <CardComponent
                key={card.uid}
                card={card}
                gamePieceAppearance={uiState.cardPositions[card.uid]}
                onClick={emit.playerCardClick(card)}
                options={{ showAbilityButton: gameState.turn.player === player.uid && !hasTag("stagingEvent") }}
                isHighlighted={
                  (hasTag("usingAbility") && test.playerCardClick(card)) ||
                  (guards.isOnStage(card) && guards.isCardBuyStageEvent())
                }
                withFloatAnimation={gameState.stage?.effect?.includes(card.uid)}
              />
            ),
        ),
      )}

      <EndTurnButton />
    </AnimatePresence>
  );
};

export default Croupier;
