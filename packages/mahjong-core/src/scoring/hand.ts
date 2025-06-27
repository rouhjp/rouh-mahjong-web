import { Side, Tile, Wind } from '../tiles';
import { LimitType } from './limit';
import type { Meld } from './meld';
import type { PointType } from './point';

export class Hand {
  readonly handTiles: Tile[];              // 手牌(和了牌を含めない)
  readonly winningTile: Tile;              // 和了牌
  readonly openMelds: Meld[];              // 公開面子

  constructor(handTiles: Tile[], winningTile: Tile, openMelds: Meld[] = []) {
    this.handTiles = handTiles;
    this.winningTile = winningTile;
    this.openMelds = openMelds;
  }

  /**
   * 手牌の全ての牌を取得します（手牌 + 公開面子の全牌 + 和了牌）
   * @returns 全ての牌のリスト（槓子は4枚で計算）
   */
  getAllTiles(): Tile[] {
    const allTiles: Tile[] = [...this.handTiles];
    
    // 公開面子の全牌を追加
    for (const meld of this.openMelds) {
      allTiles.push(...meld.getAllTiles());
    }
    
    // 和了牌を追加
    allTiles.push(this.winningTile);
    
    return allTiles;
  }

  /**
   * 手牌の切り詰められた牌を取得します（手牌 + 公開面子の3枚牌 + 和了牌）
   * @returns 切り詰められた牌のリスト（槓子は3枚で計算）
   */
  getTruncatedTiles(): Tile[] {
    const allTiles: Tile[] = [...this.handTiles];
    
    // 公開面子の切り詰められた牌を追加
    for (const meld of this.openMelds) {
      allTiles.push(...meld.getTruncatedTiles());
    }
    
    // 和了牌を追加
    allTiles.push(this.winningTile);
    
    return allTiles;
  }
}

// 手役の点数計算結果
export interface HandScore {
  point: number;                      // 符
  doubles: number;                    // 翻数
  limit: LimitType;                   // 点数区分
  pointTypes: PointType[];            // 符の詳細リスト
  handTypes: HandType[];              // 役のリスト
  completerSides: Side[];             // 役満を完成させたプレイヤーの風位
  supplierSide: Side;                 // 放銃者もしくは責任払いの風位
  winnerWind: Wind;                   // 和了者の風位
}

// 役の定義
export interface HandType {
  name: string;        // 役の名前
  isLimit: boolean;    // 役満もしくは流し満貫かどうか
  doubles: number;     // 翻数（通常役の場合は1〜、役満の場合は0）
  limitType: LimitType; // 点数区分（役満、ダブル役満、流し満貫の場合に指定、その他はEMPTY）
}
