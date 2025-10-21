"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { X, CalendarIcon, Download } from "lucide-react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface AdvancedFiltersProps {
  searchQuery: string
  setSearchQuery: (value: string) => void
  statusFilter: string
  setStatusFilter: (value: string) => void
  positionFilter: string
  setPositionFilter: (value: string) => void
  trackFilter: string
  setTrackFilter: (value: string) => void
  dateFrom: Date | undefined
  setDateFrom: (date: Date | undefined) => void
  dateTo: Date | undefined
  setDateTo: (date: Date | undefined) => void
  onReset: () => void
  onExport: (format: "csv" | "json") => void
  positions: string[]
  tracks: string[]
  activeFiltersCount: number
}

export function AdvancedFilters({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  positionFilter,
  setPositionFilter,
  trackFilter,
  setTrackFilter,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  onReset,
  onExport,
  positions,
  tracks,
  activeFiltersCount,
}: AdvancedFiltersProps) {
  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        {/* Search and Status */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="search">검색</Label>
            <Input
              id="search"
              placeholder="이름, 포지션, 트랙으로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">상태</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger id="status">
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="created">생성됨</SelectItem>
                <SelectItem value="sent">발송됨</SelectItem>
                <SelectItem value="viewed">열람함</SelectItem>
                <SelectItem value="accepted">수락함</SelectItem>
                <SelectItem value="declined">거절함</SelectItem>
                <SelectItem value="inquiry">문의</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Position and Track */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="position">포지션</Label>
            <Select value={positionFilter} onValueChange={setPositionFilter}>
              <SelectTrigger id="position">
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                {positions.map((position) => (
                  <SelectItem key={position} value={position}>
                    {position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="track">트랙</Label>
            <Select value={trackFilter} onValueChange={setTrackFilter}>
              <SelectTrigger id="track">
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                {tracks.map((track) => (
                  <SelectItem key={track} value={track}>
                    {track}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Date Range */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>생성일 (시작)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-transparent",
                    !dateFrom && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFrom ? format(dateFrom, "PPP", { locale: ko }) : "날짜 선택"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label>생성일 (종료)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-transparent",
                    !dateTo && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateTo ? format(dateTo, "PPP", { locale: ko }) : "날짜 선택"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onReset} disabled={activeFiltersCount === 0}>
            <X className="h-4 w-4 mr-2" />
            필터 초기화
          </Button>
          <Button variant="outline" size="sm" onClick={() => onExport("csv")}>
            <Download className="h-4 w-4 mr-2" />
            CSV 내보내기
          </Button>
          <Button variant="outline" size="sm" onClick={() => onExport("json")}>
            <Download className="h-4 w-4 mr-2" />
            JSON 내보내기
          </Button>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {activeFiltersCount}개 필터 적용됨
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
