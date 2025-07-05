import * as _ from "lodash";
import { Wind } from "../tiles";
import { ActionSelector, CallAction } from "./event";

function priorityOf(action: CallAction): number {
  switch (action.type) {
    case "Ron": return 3;
    case "Kan": return 2;
    case "Pon": return 2;
    case "Chi": return 1;
    case "Pass": return 0;
  }
}

export interface SignedCallAction {
  wind: Wind;
  action: CallAction;
}

async function ask(player: ActionSelector, choices: CallAction[], wind: Wind, timeoutMs: number = 30000): Promise<SignedCallAction> {
  if (choices.length === 0) {
    throw new Error("no choices available");
  }
  if (choices.length === 1) {
    return { wind, action: choices[0] };
  }
  
  // タイムアウト付きでプレイヤーの選択を待つ
  const action = await Promise.race([
    player.selectCallAction(choices),
    new Promise<CallAction>((_, reject) => 
      setTimeout(() => reject(new Error("selection timeout")), timeoutMs)
    )
  ]).catch(error => {
    if (error.message === "selection timeout") {
      // タイムアウト時はPassを選択（Passが選択肢にある場合）
      const passAction = choices.find(choice => choice.type === "Pass");
      if (passAction) {
        return passAction;
      }
      // Passがない場合は最初の選択肢を選択
      return choices[0];
    }
    throw error;
  });
  
  if (!choices.some(choice => _.isEqual(choice, action))) {
    throw new Error("invalid action selected");
  }
  return { wind, action };
}

export async function mediateCallActions(players: Map<Wind, ActionSelector>, choices: Map<Wind, CallAction[]>, timeoutMs: number = 30000): Promise<SignedCallAction[]> {
  // すべてパスのみの場合は空の配列を返す
  if (Array.from(choices.values()).every(actions => actions.length === 1 && actions[0].type === "Pass")) {
    return [];
  }
  
  // 各プレイヤーの最高優先度を事前計算
  const highestPriorities = new Map<Wind, number>();
  for (const wind of players.keys()) {
    const windChoices = choices.get(wind);
    if (!windChoices) {
      throw new Error(`No choices available for wind: ${wind}`);
    }
    const highestPriority = windChoices.map(priorityOf).reduce((max, p) => Math.max(max, p), -1);
    highestPriorities.set(wind, highestPriority);
  }

  const service = new ExecutorCompletionService<SignedCallAction>();
  
  // 全プレイヤーのアクション選択を並行実行
  for (const wind of players.keys()) {
    const player = players.get(wind);
    const windChoices = choices.get(wind);
    
    if (!player || !windChoices) {
      throw new Error(`Missing player or choices for wind: ${wind}`);
    }
    
    service.submit(async () => ask(player, windChoices, wind, timeoutMs));
  }
  
  const answers: SignedCallAction[] = [];
  let processedCount = 0;
  
  try {
    // 完了したタスクから順次処理
    while (processedCount < players.size) {
      const answer = await service.take();
      processedCount++;
      
      const priority = priorityOf(answer.action);
      highestPriorities.delete(answer.wind);
      
      if (answer.action.type !== "Pass") {
        // より低い優先度のアクションを除外
        const filteredAnswers = answers.filter(a => priorityOf(a.action) >= priority);
        answers.length = 0;
        answers.push(...filteredAnswers, answer);
        
        // 残りのプレイヤーの最高優先度がすべて現在の優先度未満の場合、早期終了可能
        const remainingHighestPriorities = Array.from(highestPriorities.values());
        if (remainingHighestPriorities.length > 0 && remainingHighestPriorities.every(p => p < priority)) {
          // 残りのタスクを待たずに終了（より高い優先度のアクションは出現しない）
          break;
        }
      }
    }
    
    return answers;
  } catch (error) {
    // エラーが発生した場合は適切にハンドリング
    throw new Error(`Failed to mediate player actions: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export class ExecutorCompletionService<T> {
  private completionQueue: T[] = [];
  private waitingResolvers: Array<(result: T) => void> = [];

  // タスクを送信
  submit<R extends T>(task: () => Promise<R>): void {
    task()
      .then(result => {
        this.handleCompletion(result);
      })
      .catch(error => {
        this.handleCompletion(error);
      });
  }

  // 完了した次のタスクを取得（ブロッキング）
  async take(): Promise<T> {
    // キューに結果がある場合は即座に返す
    if (this.completionQueue.length > 0) {
      return this.completionQueue.shift()!;
    }

    // キューが空の場合は完了を待つ
    return new Promise<T>((resolve) => {
      this.waitingResolvers.push(resolve);
    });
  }

  private handleCompletion(result: T): void {
    // 待機中のresolverがある場合は直接渡す
    if (this.waitingResolvers.length > 0) {
      const resolver = this.waitingResolvers.shift()!;
      resolver(result);
    } else {
      // 待機中のresolverがない場合はキューに追加
      this.completionQueue.push(result);
    }
  }
}