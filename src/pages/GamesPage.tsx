import React, { useState } from 'react';
import { Sparkles, CheckSquare, Eye, RotateCcw, Award } from 'lucide-react';

export const GamesPage: React.FC = () => {
  // Scavenger hunt checklist state
  const [huntItems, setHuntItems] = useState([
    { id: 1, text: 'Something round (e.g. smooth pebble or wild seed)', checked: false },
    { id: 2, text: 'Something rough (e.g. tree bark or textured twig)', checked: false },
    { id: 3, text: 'A fallen dry eucalyptus leaf', checked: false },
    { id: 4, text: 'Hear a mountain bird song or call', checked: false },
    { id: 5, text: 'Find three different natural shades of green', checked: false },
  ]);

  // Memory Game State
  const [memoryRevealed, setMemoryRevealed] = useState(false);
  const [memoryItems] = useState(['Compass', 'Indigenous Leaf', 'Canvas Tent', 'Water Bottle', 'Sunbird']);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [score, setScore] = useState<number | null>(null);

  const toggleHunt = (id: number) => {
    setHuntItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const handleGuessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    const clean = inputVal.trim();
    if (!guesses.some((g) => g.toLowerCase() === clean.toLowerCase())) {
      setGuesses([...guesses, clean]);
    }
    setInputVal('');
  };

  const checkScore = () => {
    let matches = 0;
    guesses.forEach((g) => {
      if (memoryItems.some((m) => m.toLowerCase().includes(g.toLowerCase()))) {
        matches++;
      }
    });
    setScore(matches);
  };

  const resetMemoryGame = () => {
    setMemoryRevealed(false);
    setGuesses([]);
    setScore(null);
  };

  const completedCount = huntItems.filter((i) => i.checked).length;

  return (
    <div className="space-y-8 pb-16">
      {/* Banner */}
      <section className="bg-gradient-to-r from-[#173a2b] to-[#26533f] text-white rounded-2xl p-6 sm:p-8 shadow-sm border border-emerald-900">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-bold tracking-wider uppercase text-amber-400">Driftwood Camp Activities</span>
          <h1 className="text-3xl font-black">Family Camp Games</h1>
          <p className="text-sm text-emerald-100/90 leading-relaxed">
            Practice outdoor skills and nature awareness at home together with your camper.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Game 1: Nature Scavenger Hunt */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wide">Outdoor Observation</span>
              <h2 className="text-lg font-black text-stone-900">Nature Scavenger Hunt</h2>
            </div>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full">
              {completedCount} / {huntItems.length}
            </span>
          </div>

          <p className="text-xs text-stone-600">
            Observe without picking live plants or disturbing wildlife. Tick off each item when found outdoors or in the garden:
          </p>

          <div className="space-y-2.5 pt-2">
            {huntItems.map((item) => (
              <label
                key={item.id}
                className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                  item.checked
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950 font-semibold'
                    : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100/60'
                }`}
              >
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => toggleHunt(item.id)}
                  className="w-4 h-4 text-emerald-800 rounded mt-0.5"
                />
                <span className={item.checked ? 'line-through text-emerald-800' : ''}>{item.text}</span>
              </label>
            ))}
          </div>

          {completedCount === huntItems.length && (
            <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-xs flex items-center gap-2 font-bold">
              <Award className="w-5 h-5 text-emerald-700 shrink-0" />
              <span>Great outdoor eyes! You found all 5 scavenger hunt items!</span>
            </div>
          )}
        </div>

        {/* Game 2: Knot Learning Challenge */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
          <div>
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wide">Wilderness Craft</span>
            <h2 className="text-lg font-black text-stone-900">Knot-Learning Challenge</h2>
          </div>

          <p className="text-xs text-stone-600">
            With adult supervision, practice essential camp knots with short soft cord or shoelaces.
          </p>

          <div className="space-y-3 pt-2 text-xs">
            <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
              <span className="font-bold text-emerald-950 block text-sm">1. Square Knot (Reef Knot)</span>
              <p className="text-stone-500 mt-1">
                <strong>Rule:</strong> "Right over left and under, then left over right and under."
              </p>
              <p className="text-[11px] text-stone-600 mt-1">
                Used to tie two ropes of equal thickness together when building simple shelters.
              </p>
            </div>

            <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
              <span className="font-bold text-emerald-950 block text-sm">2. Clove Hitch</span>
              <p className="text-stone-500 mt-1">
                <strong>Rule:</strong> Wrap around the post twice and pass under the crossing loop.
              </p>
              <p className="text-[11px] text-stone-600 mt-1">
                A classic camp favorite for securing lines to wooden tent pegs.
              </p>
            </div>

            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-950 text-[11px]">
              <strong>Safety Rule:</strong> Practice seated. Never put cord around necks, and always store cords safely after practice.
            </div>
          </div>
        </div>

        {/* Game 3: Team Memory Game */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
          <div>
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wide">Focus & Memory</span>
            <h2 className="text-lg font-black text-stone-900">Camp Memory Challenge</h2>
          </div>

          <p className="text-xs text-stone-600">
            Memorize the 5 essential wilderness gear items, hide them, and see how many you can recall!
          </p>

          {!memoryRevealed ? (
            <div className="bg-stone-50 p-5 rounded-xl border border-stone-200 text-center space-y-3">
              <p className="text-xs text-stone-500">Items are hidden.</p>
              <button
                onClick={() => setMemoryRevealed(true)}
                className="bg-emerald-900 hover:bg-emerald-800 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 mx-auto cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Reveal 5 Items (10 seconds)</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <span className="text-[11px] font-bold text-amber-900 block mb-1">Memorize these items:</span>
                <div className="flex flex-wrap gap-1.5">
                  {memoryItems.map((item) => (
                    <span
                      key={item}
                      className="bg-white text-stone-800 text-xs font-semibold px-2.5 py-1 rounded-md border border-amber-200"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <form onSubmit={handleGuessSubmit} className="space-y-2">
                <label className="block text-xs font-bold text-stone-700">Type what you recall:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    placeholder="e.g. Compass"
                    className="flex-1 bg-stone-50 border border-stone-300 rounded-lg px-3 py-1.5 text-xs text-stone-800"
                  />
                  <button
                    type="submit"
                    className="bg-emerald-900 text-white font-bold px-3 py-1.5 rounded-lg text-xs"
                  >
                    Add
                  </button>
                </div>
              </form>

              {guesses.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-stone-500">Your recalled items:</span>
                  <div className="flex flex-wrap gap-1">
                    {guesses.map((g, idx) => (
                      <span key={idx} className="bg-stone-100 text-stone-800 text-xs px-2 py-0.5 rounded">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={checkScore}
                  className="bg-amber-400 hover:bg-amber-300 text-stone-900 font-bold px-4 py-1.5 rounded-lg text-xs"
                >
                  Score My Memory
                </button>
                <button
                  onClick={resetMemoryGame}
                  className="text-stone-500 hover:text-stone-800 text-xs flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              </div>

              {score !== null && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-bold">
                  You recalled {score} out of {memoryItems.length} items correctly!
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
