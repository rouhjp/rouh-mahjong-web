import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ExecutorCompletionService, mediateCallActions } from './mediator';
import { Tile, Wind, Winds } from '../tiles';
import { ActionSelector, CallAction } from './event';

const { EAST, SOUTH, WEST, NORTH } = Winds;

describe('ExecutorCompletionService', () => {
  let completionService: ExecutorCompletionService<string>;

  beforeEach(() => {
    completionService = new ExecutorCompletionService<string>();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('submit', () => {
    it('should submit a task and complete it', async () => {
      const task = vi.fn().mockResolvedValue('Test Result');
      
      completionService.submit(task);
      
      // タスクの完了を待つ
      await vi.runAllTimersAsync();
      
      expect(task).toHaveBeenCalledOnce();
      
      const result = await completionService.take();
      expect(result).toBe('Test Result');
    });

    it('should handle task errors', async () => {
      const error = new Error('Test Error');
      const task = vi.fn().mockRejectedValue(error);
      
      completionService.submit(task);
      
      await vi.runAllTimersAsync();
      
      const result = await completionService.take();
      expect(result).toBe(error);
    });

    it('should handle multiple tasks', async () => {
      const task1 = vi.fn().mockResolvedValue('Task 1');
      const task2 = vi.fn().mockResolvedValue('Task 2');
      
      completionService.submit(task1);
      completionService.submit(task2);
      
      await vi.runAllTimersAsync();
      
      const result1 = await completionService.take();
      const result2 = await completionService.take();
      
      expect([result1, result2]).toEqual(expect.arrayContaining(['Task 1', 'Task 2']));
    });
  });

  describe('take', () => {
    it('should return result immediately if available', async () => {
      const task = vi.fn().mockResolvedValue('Immediate Result');
      
      completionService.submit(task);
      await vi.runAllTimersAsync();
      
      const result = await completionService.take();
      
      expect(result).toBe('Immediate Result');
    });

    it('should wait for completion if no results available', async () => {
      const task = vi.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve('Delayed Result'), 1000))
      );
      
      completionService.submit(task);
      
      const resultPromise = completionService.take();
      
      // タスクが完了するまで待つ
      await vi.advanceTimersByTimeAsync(1000);
      const result = await resultPromise;
      
      expect(result).toBe('Delayed Result');
    });
  });


  describe('task completion order', () => {
    it('should return results in completion order, not submission order', async () => {
      const tasks = [
        vi.fn().mockImplementation(() => 
          new Promise(resolve => setTimeout(() => resolve('Task 1'), 1000))
        ),
        vi.fn().mockImplementation(() => 
          new Promise(resolve => setTimeout(() => resolve('Task 2'), 500))
        ),
        vi.fn().mockImplementation(() => 
          new Promise(resolve => setTimeout(() => resolve('Task 3'), 1500))
        )
      ];
      
      // タスクを順番に送信
      completionService.submit(tasks[0]);
      completionService.submit(tasks[1]);
      completionService.submit(tasks[2]);
      
      const results: string[] = [];
      
      // 最初のタスクが完了するまで待つ（Task 2が最初に完了）
      await vi.advanceTimersByTimeAsync(500);
      results.push(await completionService.take());
      
      // 2番目のタスクが完了するまで待つ（Task 1が2番目に完了）
      await vi.advanceTimersByTimeAsync(500);
      results.push(await completionService.take());
      
      // 3番目のタスクが完了するまで待つ（Task 3が最後に完了）
      await vi.advanceTimersByTimeAsync(500);
      results.push(await completionService.take());
      
      // 完了順序の確認（完了時間順）
      expect(results[0]).toBe('Task 2');
      expect(results[1]).toBe('Task 1');
      expect(results[2]).toBe('Task 3');
    });
  });

});

// 非同期タイミング制御可能なActionSelector実装
class MockActionSelector implements ActionSelector {
  private responses: CallAction[] = [];
  private responseIndex = 0;
  private pendingResolvers: Array<() => void> = [];
  private waitingForResponse = false;

  constructor(responses: CallAction[]) {
    this.responses = responses;
  }

  async selectTurnAction(): Promise<any> {
    throw new Error('Not implemented for this test');
  }

  async selectCallAction(choices: CallAction[]): Promise<CallAction> {
    if (this.responseIndex >= this.responses.length) {
      throw new Error('No more responses available');
    }

    const response = this.responses[this.responseIndex++];
    
    // 選択肢に含まれているかチェック
    if (!choices.some(choice => JSON.stringify(choice) === JSON.stringify(response))) {
      throw new Error(`Response ${JSON.stringify(response)} not in choices ${JSON.stringify(choices)}`);
    }

    // 非同期で待機
    this.waitingForResponse = true;
    return new Promise<CallAction>((resolve) => {
      this.pendingResolvers.push(() => {
        this.waitingForResponse = false;
        resolve(response);
      });
    });
  }

  // テストから呼び出してレスポンスを返す
  respond(): void {
    if (this.pendingResolvers.length > 0) {
      const resolver = this.pendingResolvers.shift()!;
      resolver(); // resolverは既に引数を取らない関数として設計されている
    }
  }

  // すべての待機中のレスポンスを返す
  respondAll(): void {
    while (this.pendingResolvers.length > 0) {
      this.respond();
    }
  }

  // 待機中かどうかを確認
  isWaiting(): boolean {
    return this.waitingForResponse && this.pendingResolvers.length > 0;
  }

  // リセット
  reset(): void {
    this.responseIndex = 0;
    this.pendingResolvers = [];
    this.waitingForResponse = false;
  }
}

// 即座にレスポンスを返すシンプルなActionSelector（既存のテスト用）
class SimpleActionSelector implements ActionSelector {
  private response: CallAction;

  constructor(response: CallAction) {
    this.response = response;
  }

  async selectTurnAction(): Promise<any> {
    throw new Error('Not implemented for this test');
  }

  async selectCallAction(choices: CallAction[]): Promise<CallAction> {
    // 選択肢に含まれているかチェック
    if (!choices.some(choice => JSON.stringify(choice) === JSON.stringify(this.response))) {
      throw new Error(`Response ${JSON.stringify(this.response)} not in choices ${JSON.stringify(choices)}`);
    }
    
    return this.response;
  }
}

describe('mediate', () => {
  let players: Map<Wind, ActionSelector>;
  let choices: Map<Wind, CallAction[]>;

  beforeEach(() => {
    players = new Map();
    choices = new Map();
  });

  describe('all players pass', () => {
    it('should return empty array when all players can only pass', async () => {
      // 全員がパスしか選択肢がない場合（捨て牌プレイヤーを除く3人）
      const passChoice: CallAction[] = [{ type: "Pass" }];
      
      players.set(SOUTH, new SimpleActionSelector({ type: "Pass" }));
      players.set(WEST, new SimpleActionSelector({ type: "Pass" }));
      players.set(NORTH, new SimpleActionSelector({ type: "Pass" }));
      
      choices.set(SOUTH, passChoice);
      choices.set(WEST, passChoice);
      choices.set(NORTH, passChoice);

      const result = await mediateCallActions(players, choices);
      
      expect(result).toEqual([]);
    });
  });

  describe('single high priority action', () => {
    it('should return Ron action when one player chooses Ron', async () => {
      const ronSelector = new SimpleActionSelector({ type: "Ron" });
      const passSelector1 = new SimpleActionSelector({ type: "Pass" });
      const passSelector2 = new SimpleActionSelector({ type: "Pass" });
      
      players.set(SOUTH, ronSelector);
      players.set(WEST, passSelector1);
      players.set(NORTH, passSelector2);
      
      choices.set(SOUTH, [{ type: "Ron" }, { type: "Pass" }]);
      choices.set(WEST, [{ type: "Pass" }]);
      choices.set(NORTH, [{ type: "Pass" }]);

      const result = await mediateCallActions(players, choices);
      
      expect(result).toHaveLength(1);
      expect(result[0].wind).toBe(SOUTH);
      expect(result[0].action.type).toBe("Ron");
    });

    it('should return Kan action when one player chooses Kan', async () => {
      const kanSelector = new SimpleActionSelector({ type: "Kan" });
      const passSelector1 = new SimpleActionSelector({ type: "Pass" });
      const passSelector2 = new SimpleActionSelector({ type: "Pass" });
      
      players.set(SOUTH, kanSelector);
      players.set(WEST, passSelector1);
      players.set(NORTH, passSelector2);
      
      choices.set(SOUTH, [{ type: "Kan" }, { type: "Pass" }]);
      choices.set(WEST, [{ type: "Pass" }]);
      choices.set(NORTH, [{ type: "Pass" }]);

      const result = await mediateCallActions(players, choices);
      
      expect(result).toHaveLength(1);
      expect(result[0].wind).toBe(SOUTH);
      expect(result[0].action.type).toBe("Kan");
    });
  });

  describe('multiple actions with different priorities', () => {
    it('should prioritize Ron over Kan', async () => {
      const ronSelector = new SimpleActionSelector({ type: "Ron" });
      const kanSelector = new SimpleActionSelector({ type: "Kan" });
      const passSelector = new SimpleActionSelector({ type: "Pass" });
      
      players.set(SOUTH, ronSelector);
      players.set(WEST, kanSelector);
      players.set(NORTH, passSelector);
      
      choices.set(SOUTH, [{ type: "Ron" }, { type: "Pass" }]);
      choices.set(WEST, [{ type: "Kan" }, { type: "Pass" }]);
      choices.set(NORTH, [{ type: "Pass" }]);

      const result = await mediateCallActions(players, choices);
      
      expect(result).toHaveLength(1);
      expect(result[0].wind).toBe(SOUTH);
      expect(result[0].action.type).toBe("Ron");
    });

    it('should prioritize Kan/Pon over Chi', async () => {
      const baseTiles: Tile[] = []; // モック用の空配列
      
      const ponSelector = new SimpleActionSelector({ type: "Pon", baseTiles });
      const chiSelector = new SimpleActionSelector({ type: "Chi", baseTiles });
      const passSelector = new SimpleActionSelector({ type: "Pass" });
      
      players.set(SOUTH, ponSelector);
      players.set(WEST, chiSelector);
      players.set(NORTH, passSelector);
      
      choices.set(SOUTH, [{ type: "Pon", baseTiles }, { type: "Pass" }]);
      choices.set(WEST, [{ type: "Chi", baseTiles }, { type: "Pass" }]);
      choices.set(NORTH, [{ type: "Pass" }]);

      const result = await mediateCallActions(players, choices);
      
      expect(result).toHaveLength(1);
      expect(result[0].wind).toBe(SOUTH);
      expect(result[0].action.type).toBe("Pon");
    });

    it('should return Chi when it is the highest priority action', async () => {
      const baseTiles: Tile[] = []; // モック用の空配列
      
      const chiSelector = new SimpleActionSelector({ type: "Chi", baseTiles });
      const passSelector1 = new SimpleActionSelector({ type: "Pass" });
      const passSelector2 = new SimpleActionSelector({ type: "Pass" });
      
      players.set(SOUTH, chiSelector);
      players.set(WEST, passSelector1);
      players.set(NORTH, passSelector2);
      
      choices.set(SOUTH, [{ type: "Chi", baseTiles }, { type: "Pass" }]);
      choices.set(WEST, [{ type: "Pass" }]);
      choices.set(NORTH, [{ type: "Pass" }]);

      const result = await mediateCallActions(players, choices);
      
      expect(result).toHaveLength(1);
      expect(result[0].wind).toBe(SOUTH);
      expect(result[0].action.type).toBe("Chi");
    });
  });

  describe('multiple actions with same priority', () => {
    it('should return all Ron actions when multiple players choose Ron', async () => {
      const ronSelector1 = new SimpleActionSelector({ type: "Ron" });
      const ronSelector2 = new SimpleActionSelector({ type: "Ron" });
      const passSelector = new SimpleActionSelector({ type: "Pass" });
      
      players.set(SOUTH, ronSelector1);
      players.set(WEST, ronSelector2);
      players.set(NORTH, passSelector);
      
      choices.set(SOUTH, [{ type: "Ron" }, { type: "Pass" }]);
      choices.set(WEST, [{ type: "Ron" }, { type: "Pass" }]);
      choices.set(NORTH, [{ type: "Pass" }]);

      const result = await mediateCallActions(players, choices);
      
      expect(result).toHaveLength(2);
      expect(result.every(r => r.action.type === "Ron")).toBe(true);
      
      const winds = result.map(r => r.wind);
      expect(winds).toContain(SOUTH);
      expect(winds).toContain(WEST);
    });
  });

  describe('timing control tests', () => {
    it('should handle responses in any order', async () => {
      const southSelector = new MockActionSelector([{ type: "Ron" }]);
      const westSelector = new MockActionSelector([{ type: "Pass" }]);
      const northSelector = new MockActionSelector([{ type: "Pass" }]);
      
      players.set(SOUTH, southSelector);
      players.set(WEST, westSelector);
      players.set(NORTH, northSelector);
      
      choices.set(SOUTH, [{ type: "Ron" }, { type: "Pass" }]);
      choices.set(WEST, [{ type: "Pass" }]);
      choices.set(NORTH, [{ type: "Pass" }]);

      // mediateを非同期で開始
      const mediatePromise = mediateCallActions(players, choices);
      
      // 少し待ってから、各プレイヤーが順次回答
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // 西、北、南の順で回答（提出順と異なる）
      westSelector.respond();
      northSelector.respond();
      southSelector.respond(); // 最後にRonを回答
      
      const result = await mediatePromise;
      
      expect(result).toHaveLength(1);
      expect(result[0].action.type).toBe("Ron");
      expect(result[0].wind).toBe(SOUTH);
    });

    it('should handle delayed responses correctly', async () => {
      const ronSelector = new MockActionSelector([{ type: "Ron" }]);
      const kanSelector = new MockActionSelector([{ type: "Kan" }]);
      const passSelector = new MockActionSelector([{ type: "Pass" }]);
      
      players.set(SOUTH, ronSelector);
      players.set(WEST, kanSelector);
      players.set(NORTH, passSelector);
      
      choices.set(SOUTH, [{ type: "Ron" }, { type: "Pass" }]);
      choices.set(WEST, [{ type: "Kan" }, { type: "Pass" }]);
      choices.set(NORTH, [{ type: "Pass" }]);

      const mediatePromise = mediateCallActions(players, choices);
      
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // まずKanを回答
      kanSelector.respond();
      passSelector.respond();
      
      // Kanが回答された後、Ronが回答される前の中間状態を確認
      await new Promise(resolve => setTimeout(resolve, 20));
      
      // この時点でKanが処理されているが、Ronはまだ待機中
      expect(ronSelector.isWaiting()).toBe(true);
      expect(kanSelector.isWaiting()).toBe(false);
      
      // 後でRonを回答（優先度が高いのでRonが選ばれる）
      ronSelector.respond();
      
      const result = await mediatePromise;
      
      expect(result).toHaveLength(1);
      expect(result[0].action.type).toBe("Ron");
      expect(result[0].wind).toBe(SOUTH);
    });

    it('should collect multiple actions of same priority', async () => {
      const ronSelector1 = new MockActionSelector([{ type: "Ron" }]);
      const ronSelector2 = new MockActionSelector([{ type: "Ron" }]);
      const passSelector = new MockActionSelector([{ type: "Pass" }]);
      
      players.set(SOUTH, ronSelector1);
      players.set(WEST, ronSelector2);
      players.set(NORTH, passSelector);
      
      choices.set(SOUTH, [{ type: "Ron" }, { type: "Pass" }]);
      choices.set(WEST, [{ type: "Ron" }, { type: "Pass" }]);
      choices.set(NORTH, [{ type: "Pass" }]);

      const mediatePromise = mediateCallActions(players, choices);
      
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // 異なるタイミングで両方のRonを回答
      ronSelector1.respond();
      passSelector.respond();
      
      await new Promise(resolve => setTimeout(resolve, 20));
      
      ronSelector2.respond();
      
      const result = await mediatePromise;
      
      expect(result).toHaveLength(2);
      expect(result.every(r => r.action.type === "Ron")).toBe(true);
      
      const winds = result.map(r => r.wind);
      expect(winds).toContain(SOUTH);
      expect(winds).toContain(WEST);
    });
  });

  describe('timeout functionality', () => {
    it('should timeout and select Pass when no response within time limit', async () => {
      const slowSelector = new MockActionSelector([{ type: "Ron" }]);
      
      players.set(SOUTH, slowSelector);
      players.set(WEST, new SimpleActionSelector({ type: "Pass" }));
      players.set(NORTH, new SimpleActionSelector({ type: "Pass" }));
      
      choices.set(SOUTH, [{ type: "Ron" }, { type: "Pass" }]);
      choices.set(WEST, [{ type: "Pass" }]);
      choices.set(NORTH, [{ type: "Pass" }]);

      // 短いタイムアウト（100ms）でテスト
      const mediatePromise = mediateCallActions(players, choices, 100);
      
      // WESTとNORTHは即座に応答
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // SOUTHは応答しない（タイムアウトでPassが選択される）
      // slowSelector.respond(); を呼ばない
      
      const result = await mediatePromise;
      
      expect(result).toHaveLength(0); // 全員Pass扱いなので空配列
    });

    it('should not timeout when response comes in time', async () => {
      const quickSelector = new MockActionSelector([{ type: "Ron" }]);
      
      players.set(SOUTH, quickSelector);
      players.set(WEST, new SimpleActionSelector({ type: "Pass" }));
      players.set(NORTH, new SimpleActionSelector({ type: "Pass" }));
      
      choices.set(SOUTH, [{ type: "Ron" }, { type: "Pass" }]);
      choices.set(WEST, [{ type: "Pass" }]);
      choices.set(NORTH, [{ type: "Pass" }]);

      // 長いタイムアウト（1000ms）でテスト
      const mediatePromise = mediateCallActions(players, choices, 1000);
      
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // 素早く応答
      quickSelector.respond();
      
      const result = await mediatePromise;
      
      expect(result).toHaveLength(1);
      expect(result[0].action.type).toBe("Ron");
      expect(result[0].wind).toBe(SOUTH);
    });

    it('should default to first choice when no Pass available and timeout occurs', async () => {
      const slowSelector = new MockActionSelector([{ type: "Ron" }]);
      
      players.set(SOUTH, slowSelector);
      players.set(WEST, new SimpleActionSelector({ type: "Pass" }));
      players.set(NORTH, new SimpleActionSelector({ type: "Pass" }));
      
      // Passがない選択肢でテスト
      choices.set(SOUTH, [{ type: "Ron" }, { type: "Kan" }]);
      choices.set(WEST, [{ type: "Pass" }]);
      choices.set(NORTH, [{ type: "Pass" }]);

      const mediatePromise = mediateCallActions(players, choices, 100);
      
      // 応答しない（タイムアウトで最初の選択肢が選ばれる）
      
      const result = await mediatePromise;
      
      expect(result).toHaveLength(1);
      expect(result[0].action.type).toBe("Ron"); // 最初の選択肢
      expect(result[0].wind).toBe(SOUTH);
    });
  });
});
