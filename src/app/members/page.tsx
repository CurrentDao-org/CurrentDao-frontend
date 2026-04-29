'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search, Users, TrendingUp, Star, Medal, UserPlus, UserMinus, Eye,
  Shield, Wallet, Award, Zap, Filter, Grid, List, ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DAOMember {
  id: string;
  name: string;
  avatar?: string;
  walletAddress: string;
  contributionScore: number;
  votesCast: number;
  proposalsSubmitted: number;
  energyTraded: number;
  joinedDate: string;
  isFollowed: boolean;
  isPublic: boolean;
  badges: string[];
}

interface ContributionLeader {
  rank: number;
  id: string;
  name: string;
  score: number;
  category: 'votes' | 'proposals' | 'energy' | 'overall';
}

const MOCK_MEMBERS: DAOMember[] = [
  { id: '1', name: 'Alice Builder', walletAddress: '0x1234...abcd', contributionScore: 9850, votesCast: 142, proposalsSubmitted: 12, energyTraded: 4500, joinedDate: '2025-01-15', isFollowed: false, isPublic: true, badges: ['Top Voter', 'Proposal Expert'] },
  { id: '2', name: 'Bob Energy', walletAddress: '0x5678...efgh', contributionScore: 7200, votesCast: 89, proposalsSubmitted: 5, energyTraded: 12000, joinedDate: '2025-02-20', isFollowed: true, isPublic: true, badges: ['Energy Champion'] },
  { id: '3', name: 'Carol Governance', walletAddress: '0x90ab...cdef', contributionScore: 6400, votesCast: 201, proposalsSubmitted: 3, energyTraded: 2100, joinedDate: '2024-11-10', isFollowed: false, isPublic: true, badges: ['Governance Guru'] },
  { id: '4', name: 'Dave Trader', walletAddress: '0xdead...beef', contributionScore: 5100, votesCast: 56, proposalsSubmitted: 8, energyTraded: 8000, joinedDate: '2025-03-05', isFollowed: false, isPublic: false, badges: [] },
  { id: '5', name: 'Eve Developer', walletAddress: '0xcafe...babe', contributionScore: 8900, votesCast: 167, proposalsSubmitted: 15, energyTraded: 3200, joinedDate: '2024-09-01', isFollowed: true, isPublic: true, badges: ['Top Voter', 'Proposal Expert', 'Early Adopter'] },
];

const CATEGORIES = ['overall', 'votes', 'proposals', 'energy'] as const;

const BADGE_COLORS: Record<string, string> = {
  'Top Voter': 'bg-blue-100 text-blue-700',
  'Proposal Expert': 'bg-purple-100 text-purple-700',
  'Energy Champion': 'bg-green-100 text-green-700',
  'Governance Guru': 'bg-orange-100 text-orange-700',
  'Early Adopter': 'bg-yellow-100 text-yellow-700',
};

function MemberCard({ member, onFollow, onView }: { member: DAOMember; onFollow: (id: string) => void; onView: (id: string) => void }) {
  return (
    <div className="border rounded-lg p-5 hover:shadow-md transition-shadow bg-card">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold flex-shrink-0">
          {member.avatar ? <img src={member.avatar} alt={member.name} className="w-12 h-12 rounded-full" /> : member.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold truncate">{member.name}</h3>
            {!member.isPublic && <Shield className="w-3.5 h-3.5 text-muted-foreground" title="Private profile" />}
          </div>
          <p className="text-xs text-muted-foreground font-mono truncate">{member.walletAddress}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-500" />{member.contributionScore.toLocaleString()}</span>
            <span>{member.votesCast} votes</span>
            <span>{member.proposalsSubmitted} proposals</span>
          </div>
          {member.badges.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {member.badges.map(b => (
                <span key={b} className={cn('px-2 py-0.5 rounded-full text-xs', BADGE_COLORS[b] || 'bg-gray-100 text-gray-600')}>{b}</span>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2 flex-shrink-0">
          <button onClick={() => onView(member.id)} className="p-2 hover:bg-accent rounded-lg transition-colors" title="View profile"><Eye className="w-4 h-4" /></button>
          <button onClick={() => onFollow(member.id)} className={cn('p-2 rounded-lg transition-colors', member.isFollowed ? 'bg-primary/10 text-primary' : 'hover:bg-accent')} title={member.isFollowed ? 'Unfollow' : 'Follow'}>
            {member.isFollowed ? <UserMinus className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}

function LeaderboardCard({ rank, name, score, category }: ContributionLeader & { category: string }) {
  const medals = ['🥇', '🥈', '🥉'];
  return (
    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
      <span className="text-lg w-8 text-center">{rank <= 3 ? medals[rank - 1] : `#${rank}`}</span>
      <span className="flex-1 font-medium text-sm">{name}</span>
      <span className="text-sm font-bold">{score.toLocaleString()}</span>
      <span className="text-xs text-muted-foreground capitalize">{category}</span>
    </div>
  );
}

export default function MembersPage() {
  const [members, setMembers] = useState<DAOMember[]>(MOCK_MEMBERS);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('overall');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedMember, setSelectedMember] = useState<DAOMember | null>(null);

  const filteredMembers = members.filter(m => {
    if (!m.isPublic) return false;
    if (search && !m.name.toLowerCase().includes(search.toLowerCase()) && !m.walletAddress.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const sortedMembers = [...filteredMembers].sort((a, b) => b.contributionScore - a.contributionScore);

  const leaders: ContributionLeader[] = [
    { rank: 1, id: '5', name: 'Eve Developer', score: 8900, category: 'overall' },
    { rank: 2, id: '1', name: 'Alice Builder', score: 7200, category: 'overall' },
    { rank: 3, id: '2', name: 'Bob Energy', score: 6400, category: 'overall' },
  ];

  const handleFollow = (id: string) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, isFollowed: !m.isFollowed } : m));
  };

  const handleView = (id: string) => {
    const member = members.find(m => m.id === id);
    if (member) setSelectedMember(member);
  };

  const totalMembers = members.filter(m => m.isPublic).length;
  const totalVotes = members.reduce((s, m) => s + m.votesCast, 0);
  const totalProposals = members.reduce((s, m) => s + m.proposalsSubmitted, 0);
  const avgContribution = members.length > 0 ? Math.round(members.reduce((s, m) => s + m.contributionScore, 0) / members.length) : 0;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">DAO Member Directory</h1>
        <p className="text-muted-foreground">Discover contributors and track governance participation</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-muted rounded-lg"><p className="text-xs text-muted-foreground">Members</p><p className="text-2xl font-bold">{totalMembers}</p></div>
        <div className="p-4 bg-muted rounded-lg"><p className="text-xs text-muted-foreground">Total Votes</p><p className="text-2xl font-bold">{totalVotes.toLocaleString()}</p></div>
        <div className="p-4 bg-muted rounded-lg"><p className="text-xs text-muted-foreground">Proposals</p><p className="text-2xl font-bold">{totalProposals}</p></div>
        <div className="p-4 bg-muted rounded-lg"><p className="text-xs text-muted-foreground">Avg. Contribution</p><p className="text-2xl font-bold">{avgContribution.toLocaleString()}</p></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" placeholder="Search members or wallet address..." className="w-full pl-10 pr-4 py-2 border rounded-lg" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="flex gap-2">
              {(['grid', 'list'] as const).map(mode => (
                <button key={mode} onClick={() => setViewMode(mode)} className={cn('px-3 py-2 border rounded-lg', viewMode === mode && 'bg-accent')}>
                  {mode === 'grid' ? <Grid className="w-4 h-4" /> : <List className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>

          {filteredMembers.length === 0 ? (
            <div className="text-center py-12"><Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" /><p>No members found</p></div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-3'}>
              {sortedMembers.map(member => <MemberCard key={member.id} member={member} onFollow={handleFollow} onView={handleView} />)}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold flex items-center gap-2 mb-3"><Medal className="w-4 h-4 text-yellow-500" />Top Contributors</h3>
            <div className="space-y-2">
              {leaders.map(l => <LeaderboardCard key={l.id} {...l} />)}
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold flex items-center gap-2 mb-3"><Filter className="w-4 h-4" />Filter</h3>
            <div className="space-y-1">
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setCategory(c)} className={cn('w-full text-left px-3 py-1.5 rounded text-sm', category === c ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted')}>{c.charAt(0).toUpperCase() + c.slice(1)}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {selectedMember && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedMember(null)}>
          <div className="bg-card border rounded-xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold">{selectedMember.name.charAt(0)}</div>
              <div>
                <h2 className="text-xl font-bold">{selectedMember.name}</h2>
                <p className="text-sm text-muted-foreground font-mono">{selectedMember.walletAddress}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm mb-4">
              <div className="p-3 bg-muted rounded"><p className="text-xs text-muted-foreground">Contribution Score</p><p className="font-bold">{selectedMember.contributionScore.toLocaleString()}</p></div>
              <div className="p-3 bg-muted rounded"><p className="text-xs text-muted-foreground">Votes Cast</p><p className="font-bold">{selectedMember.votesCast}</p></div>
              <div className="p-3 bg-muted rounded"><p className="text-xs text-muted-foreground">Proposals</p><p className="font-bold">{selectedMember.proposalsSubmitted}</p></div>
              <div className="p-3 bg-muted rounded"><p className="text-xs text-muted-foreground">Energy Traded</p><p className="font-bold">{selectedMember.energyTraded.toLocaleString()}</p></div>
            </div>
            {selectedMember.badges.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {selectedMember.badges.map(b => <span key={b} className={cn('px-2 py-1 rounded-full text-xs', BADGE_COLORS[b] || 'bg-gray-100')}>{b}</span>)}
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={() => handleFollow(selectedMember.id)} className={cn('flex-1 py-2 rounded-lg text-sm font-medium', selectedMember.isFollowed ? 'bg-muted' : 'bg-primary text-primary-foreground')}>
                {selectedMember.isFollowed ? 'Unfollow' : 'Follow'}
              </button>
              <button onClick={() => setSelectedMember(null)} className="flex-1 py-2 border rounded-lg text-sm">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}