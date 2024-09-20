export type Card = {
  name: string;
  id: string;
  type: CardType
}

export type Market = {
  deck: Card[],
  table: Card[]
}

export type CardType = "animal" | "plant" | "disaster" | "element"
