import { Table, TableData } from "./component/Table"
import { getDummyTiles } from "./type"

function App() {
  
  return (
    <>
      <div>
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
          <Table
            table={table}
            choices={["ロン", "チー"]}
          />
        </div>
      </div>

    </>
  )
}

export default App

const table: TableData = {
  bottom: {
    riverTiles: getDummyTiles(24),
    readyBarExists: false,
    handSize: 14,
    hasDrawnTile: true,
    isHandOpen: false,
    handTiles: getDummyTiles(13),
    drawnTile: getDummyTiles(1)[0],
    openMelds: [],
  },
  right: {
    riverTiles: getDummyTiles(24),
    readyBarExists: false,
    handSize: 10,
    hasDrawnTile: true,
    isHandOpen: false,
    openMelds: [
      { tiles: ["M1", "M1", "M1", "M1"] },
    ],
  },
  top: {
    riverTiles: getDummyTiles(24),
    readyBarExists: false,
    handSize: 10,
    hasDrawnTile: true,
    isHandOpen: false,
    openMelds: [
      { tiles: ["DW", "DW", "DW"], tiltIndex: 0, addedTile: "DW" },
    ],
  },
  left: {
    riverTiles: getDummyTiles(24),
    readyBarExists: false,
    handSize: 10,
    hasDrawnTile: true,
    isHandOpen: false,
    openMelds: [
      { tiles: ["DR", "DR", "DR"], tiltIndex: 2 },
    ],
  },
  wall: {
    top: Array.from({ length: 34 }).map(() => "back"),
    right: Array.from({ length: 34 }).map(() => "back"),
    bottom: Array.from({ length: 34 }).map(() => "back"),
    left: Array.from({ length: 34 }).map(() => "back"),
  }
}