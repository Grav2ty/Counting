"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function Page() {
  return (
    <main className="container flex min-h-screen flex-col justify-center">
      <section className="mx-auto w-full max-w-5xl">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight">카드 카운터</h1>
          <p className="mt-2 text-muted-foreground">
            <span className="text-red-600">-</span> 인 경우 High 카드가 많이 나왔음, <span className="text-green-600">+</span> 인 경우 Low 카드가 많이 나왔음. 8, 9는 중립
          </p>
        </header>

        <LandingGrid />
      </section>
    </main>
  )
}

function LandingGrid() {
  const [selectedSuitKey, setSelectedSuitKey] = useState<string | null>(null)
  const [countsMap, setCountsMap] = useState<Map<string, number>>(new Map())
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(true)
  const [history, setHistory] = useState<number[]>([])

  function handleSelectSuit({ key }: { key: string }) {
    if (!key) return
    if (selectedSuitKey === key) { setIsPanelOpen(prev => !prev); return }
    setSelectedSuitKey(key)
    setIsPanelOpen(true)
  }

  function incrementCard({ suitKey, number }: { suitKey: Suit['key']; number: number }) {
    const id = cardId({ suitKey, number })
    setCountsMap(prev => {
      const next = new Map(prev)
      const current = next.get(id) ?? 0
      next.set(id, current + 1)
      return next
    })
  }

  function decrementCard({ suitKey, number }: { suitKey: Suit['key']; number: number }) {
    const id = cardId({ suitKey, number })
    setCountsMap(prev => {
      const next = new Map(prev)
      const current = next.get(id) ?? 0
      const updated = Math.max(0, current - 1)
      if (updated === 0) next.delete(id)
      else next.set(id, updated)
      return next
    })
  }

  function resetAll() { setCountsMap(new Map()); setHistory([]) }
  function resetTotalOnly() { setHistory([]); setCountsMap(new Map()) }

  function pushHistory({ delta }: { delta: number }) {
    setHistory(prev => {
      const next = [...prev, delta]
      if (next.length > 330) next.splice(0, next.length - 330)
      return next
    })
  }

  function removeLastHistoryValue({ value }: { value: number }) {
    setHistory(prev => {
      for (let i = prev.length - 1; i >= 0; i--) {
        if (prev[i] === value) {
          const next = prev.slice(0, i).concat(prev.slice(i + 1))
          return next
        }
      }
      return prev
    })
  }

  function handleMouseAction({ suitKey, number, buttons, button }: { suitKey: Suit['key']; number: number; buttons: number; button: number }) {
    const score = scoreFor(number)
    if (buttons === 3) { // 좌+우 동시: 해당 카드 카운트 0으로, 합계 변경 없음
      setCountsMap(prev => {
        const id = cardId({ suitKey, number })
        if (!prev.has(id)) return prev
        const next = new Map(prev)
        next.delete(id)
        return next
      })
      return
    }
    if (button === 2) { // 우클릭: 카운트 감소, 합계에서는 마지막 동일 점수 항목 제거
      decrementCard({ suitKey, number })
      removeLastHistoryValue({ value: score })
      return
    }
    if (button === 0) { // 좌클릭: 카운트 증가, 합계에 점수 추가
      incrementCard({ suitKey, number })
      pushHistory({ delta: score })
    }
  }

  const selectedSuit = selectedSuitKey ? SUITS.find(s => s.key === selectedSuitKey) ?? null : null
  const total = history.reduce((acc, n) => acc + n, 0)
  const totalClass = total < 0 ? 'text-red-600' : total > 0 ? 'text-green-600' : 'text-foreground'

  return (
    <div className="w-full select-none" onContextMenu={e => { e.preventDefault() }}>
      {/* 합계 섹션을 카드 리스트 위로 이동 */}
      <section className="mb-6 rounded-xl border bg-card p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">합계</span>
          <span className={`text-2xl font-bold tabular-nums ${totalClass}`}>{total}</span>
        </div>
        <div className="mt-4 max-h-80 overflow-auto rounded-md border bg-background/40 p-2 [-ms-overflow-style:none] [scrollbar-width:thin]">
          {history.length === 0 && (
            <span className="text-xs text-muted-foreground">숫자 버튼을 클릭하면 여기에 기록됩니다 (최대 330개)</span>
          )}
          <div className="flex flex-wrap gap-1">
            {history.map((v, idx) => (
              <span key={`${v}-${idx}`} className={`inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium ${v < 0 ? 'text-red-600' : v > 0 ? 'text-green-600' : 'text-foreground'} bg-muted`}>
                {v > 0 ? `+${v}` : `${v}`}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-3 flex justify-end">
          <button type="button" onClick={resetTotalOnly} className="rounded-md border px-2.5 py-1 text-xs hover:bg-accent">합계 리셋</button>
        </div>
      </section>

      <div className="mt-8 flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">전체 카드</h3>
        <div className="flex items-center gap-2">
          <button type="button" onClick={resetAll} className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent">리셋</button>
        </div>
      </div>

      <CardList
        countsMap={countsMap}
        onMouseAction={({ suitKey, number, buttons, button }) => handleMouseAction({ suitKey, number, buttons, button })}
      />

      <div className="mt-8 grid grid-cols-4 gap-6">
        {SUITS.map(suit => (
          <button
            key={suit.key}
            type="button"
            onClick={() => handleSelectSuit({ key: suit.key })}
            className="text-left"
          >
            <Card className={`transition-colors cursor-pointer ${selectedSuitKey === suit.key ? 'ring-2 ring-primary' : ''}`} role="button">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{suit.label}</span>
                  <span className={`text-3xl ${suit.color}`}>{suit.symbol}</span>
                </CardTitle>
              </CardHeader>
              <CardContent />
            </Card>
          </button>
        ))}
      </div>

      <div className="mt-4 flex justify-end">
        <button type="button" onClick={() => setIsPanelOpen(prev => !prev)} className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent">
          {isPanelOpen ? '선택 패널 접기' : '선택 패널 펼치기'}
        </button>
      </div>

      {isPanelOpen && selectedSuit && (
        <NumbersPanel
          suit={selectedSuit}
          isActive={(n) => (countsMap.get(cardId({ suitKey: selectedSuit.key, number: n })) ?? 0) >= 1}
          getCount={(n) => countsMap.get(cardId({ suitKey: selectedSuit.key, number: n })) ?? 0}
          onMouseAction={({ number, buttons, button }) => handleMouseAction({ suitKey: selectedSuit.key, number, buttons, button })}
        />
      )}
    </div>
  )
}

function NumbersPanel({ suit, isActive, getCount, onMouseAction }: {
  suit: Suit
  isActive: (n: number) => boolean
  getCount: (n: number) => number
  onMouseAction: ({ number, buttons, button }: { number: number; buttons: number; button: number }) => void
}) {
  const numbers = generateNumbers({ from: 1, to: 13 })

  return (
    <section className="mt-8 rounded-xl border bg-card p-6">
      <header className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">{suit.label}</h2>
        <span className={`text-2xl ${suit.color}`}>{suit.symbol}</span>
      </header>

      <div className="flex items-center gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="list" aria-label={`${suit.label} 숫자 선택`}>
        {numbers.map(num => {
          const active = isActive(num)
          const count = getCount(num)
          return (
            <button
              key={num}
              type="button"
              className={`relative shrink-0 rounded-lg border px-6 py-4 text-lg font-semibold transition-colors ${active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'}`}
              aria-pressed={active}
              aria-label={`${suit.label} ${getRankLabel(num)}`}
              role="listitem"
              onMouseDown={e => onMouseAction({ number: num, buttons: e.buttons, button: e.button })}
            >
              {getRankLabel(num)}
              {count >= 2 && (
                <span className="absolute -right-2 -top-2 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-foreground px-2 text-xs font-bold text-background">+{count}</span>
              )}
            </button>
          )
        })}
      </div>
    </section>
  )
}

function generateNumbers({ from, to }: { from: number; to: number }) {
  if (to < from) return [] as number[]
  return Array.from({ length: to - from + 1 }, (_, i) => from + i)
}

const SUITS: Suit[] = [
  { key: 'hearts', label: '하트', color: 'text-red-600', symbol: '♥' },
  { key: 'diamonds', label: '다이아', color: 'text-red-600', symbol: '♦' },
  { key: 'clubs', label: '클로버', color: 'text-green-600', symbol: '♣' },
  { key: 'spades', label: '스페이드', color: 'text-gray-800', symbol: '♠' }
]

interface Suit {
  key: 'hearts' | 'diamonds' | 'clubs' | 'spades'
  label: string
  color: string
  symbol: string
}

function CardList({ countsMap, onMouseAction }: {
  countsMap: Map<string, number>
  onMouseAction: ({ suitKey, number, buttons, button }: { suitKey: Suit['key']; number: number; buttons: number; button: number }) => void
}) {
  const numbers = generateNumbers({ from: 1, to: 13 })
  return (
    <section className="mt-2 space-y-3">
      {SUITS.map(suit => (
        <div key={suit.key} className="rounded-lg border p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{suit.label}</span>
              <span className={`text-lg ${suit.color}`}>{suit.symbol}</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {numbers.map(num => {
              const id = cardId({ suitKey: suit.key, number: num })
              const count = countsMap.get(id) ?? 0
              const active = count >= 1
              return (
                <button
                  key={id}
                  type="button"
                  onMouseDown={e => onMouseAction({ suitKey: suit.key, number: num, buttons: e.buttons, button: e.button })}
                  className={`relative rounded-lg border px-6 py-4 text-lg font-semibold transition-colors ${active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'}`}
                  aria-pressed={active}
                  aria-label={`${suit.label} ${getRankLabel(num)}`}
                >
                  {getRankLabel(num)}
                  {count >= 2 && (
                    <span className="absolute -right-2 -top-2 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-foreground px-2 text-xs font-bold text-background">+{count}</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </section>
  )
}

function cardId({ suitKey, number }: { suitKey: Suit['key']; number: number }) {
  return `${suitKey}-${number}`
}

function getRankLabel(n: number) {
  if (n === 11) return 'J'
  if (n === 12) return 'Q'
  if (n === 13) return 'K'
  return String(n)
}

function scoreFor(n: number) {
  const isTenFace = n === 10 || n === 11 || n === 12 || n === 13
  if (n === 1) return -1
  if (n === 2 || n === 3 || n === 7) return 1
  if (n === 4 || n === 5 || n === 6) return 2
  if (n === 8 || n === 9) return 0
  if (isTenFace) return -2
  return 0
}


