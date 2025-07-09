import { CallAction, GameEvent, TurnAction } from "./event";
import { Game, GameSpans } from "./game";
import { Player } from "./player";


class MockPlayer implements Player {
  private name: string;

  constructor(name: string) {
    this.name = name;
  }

  getName(): string {
    return this.name;
  }

  async selectTurnAction(choices: TurnAction[]): Promise<TurnAction> {
    // console.log(`${this.name} selectTurnAction: ${choices[0].type}`);
    return choices[0];
  }

  async selectCallAction(choices: CallAction[]): Promise<CallAction> {
    // console.log(`${this.name} selectCallAction: ${choices[0].type}`);
    return choices[0];
  }

  notify(event: GameEvent): void {
    if (this.name !== "Player 1") return;
    // console.log(` ${this.getName()}--> ${JSON.stringify(event)}`);
  }
}

async function main() {
  const game = new Game([
    new MockPlayer('Player 1'),
    new MockPlayer('Player 2'),
    new MockPlayer('Player 3'),
    new MockPlayer('Player 4')
  ], GameSpans.EAST_GAME);

  console.log("game started");
  await game.start().then(() => {
    console.log("game finished");
  });

}

main();


