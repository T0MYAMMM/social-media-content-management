"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Instagram,
  AtSign,
  RefreshCw,
  Plus,
  Trash2,
  Users,
  CheckCircle2,
  Plug,
  ShieldCheck,
} from "lucide-react";

import {
  useAccounts,
  useStore,
  rel,
  nid,
} from "@/components/templates/personal-brand/shared/store";
import type { SocialAccount, Platform } from "@/components/templates/personal-brand/shared/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

const platformMeta: Record<Platform, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  instagram: { label: "Instagram", icon: Instagram },
  threads: { label: "Threads", icon: AtSign },
};

function initials(name: string): string {
  const clean = name.replace(/^@/, "").replace(/[._-]+/g, " ").trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] ?? "?").concat(parts[1]?.[0] ?? "").toUpperCase();
}

const fmtCount = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : `${n}`;

/* -------------------------------------------------------------------------- */
/* Account card                                                               */
/* -------------------------------------------------------------------------- */

function AccountCard({
  account,
  onToggle,
  onSync,
  onDelete,
}: {
  account: SocialAccount;
  onToggle: (connected: boolean) => void;
  onSync: () => void;
  onDelete: () => void;
}) {
  const { label, icon: Icon } = platformMeta[account.platform];
  return (
    <div className="rounded-lg border border-border/60 bg-card p-4 transition hover:border-border">
      <div className="flex items-start gap-3">
        <Avatar className="size-11 shrink-0">
          {account.avatarUrl ? <AvatarImage src={account.avatarUrl} alt={account.displayName} /> : null}
          <AvatarFallback>{initials(account.displayName || account.handle)}</AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate text-sm font-semibold">{account.displayName}</span>
            <Badge variant="outline" className="gap-1 font-normal">
              <Icon className="size-3" />
              {label}
            </Badge>
            {account.connected ? (
              <Badge variant="outline" className="gap-1 font-normal text-green-600 dark:text-green-400">
                <CheckCircle2 className="size-3" />
                Connected
              </Badge>
            ) : (
              <Badge variant="secondary" className="font-normal">
                Disconnected
              </Badge>
            )}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">@{account.handle.replace(/^@/, "")}</p>

          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Users className="size-3.5" />
              <span className="font-medium text-foreground">{fmtCount(account.followers)}</span> followers
            </span>
            <span>
              <span className="font-medium text-foreground">{fmtCount(account.following)}</span> following
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {account.lastSyncedAt ? `Synced ${rel(account.lastSyncedAt)}` : "Never synced"}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 border-t border-border/60 pt-3">
        <div className="flex items-center gap-2">
          <Switch
            id={`conn-${account.id}`}
            checked={account.connected}
            onCheckedChange={onToggle}
            aria-label="Toggle connection"
          />
          <Label htmlFor={`conn-${account.id}`} className="text-xs text-muted-foreground">
            {account.connected ? "Connected" : "Connect"}
          </Label>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs" onClick={onSync}>
            <RefreshCw className="size-3.5" />
            Sync now
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
            onClick={onDelete}
            aria-label="Remove account"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Add dialog                                                                 */
/* -------------------------------------------------------------------------- */

function AddAccountDialog({ onAdd }: { onAdd: (a: SocialAccount) => void }) {
  const [openDlg, setOpenDlg] = React.useState(false);
  const [handle, setHandle] = React.useState("");
  const [displayName, setDisplayName] = React.useState("");
  const [platform, setPlatform] = React.useState<Platform>("instagram");

  const reset = () => {
    setHandle("");
    setDisplayName("");
    setPlatform("instagram");
  };

  const submit = () => {
    const h = handle.trim().replace(/^@/, "");
    if (!h) {
      toast.error("Enter a handle");
      return;
    }
    onAdd({
      id: nid("acct"),
      platform,
      handle: h,
      displayName: displayName.trim() || h,
      avatarUrl: "",
      followers: 0,
      following: 0,
      connected: false,
    });
    toast.success(`Added @${h}`);
    reset();
    setOpenDlg(false);
  };

  return (
    <Dialog
      open={openDlg}
      onOpenChange={(o) => {
        setOpenDlg(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button className="gap-1.5 bg-brand text-brand-foreground hover:bg-brand/90">
          <Plus className="size-4" />
          Add account
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add an account</DialogTitle>
          <DialogDescription>
            Add a profile to track. Connect it live later via Meta OAuth in Integrations.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="add-platform">Platform</Label>
            <Select value={platform} onValueChange={(v) => setPlatform(v as Platform)}>
              <SelectTrigger id="add-platform">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="threads">Threads</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="add-handle">Handle</Label>
            <Input
              id="add-handle"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="yourhandle"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="add-name">Display name</Label>
            <Input
              id="add-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your Name"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpenDlg(false)}>
            Cancel
          </Button>
          <Button className="bg-brand text-brand-foreground hover:bg-brand/90" onClick={submit}>
            Add account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------------------------------------------------------- */
/* View                                                                       */
/* -------------------------------------------------------------------------- */

export function AccountsView() {
  const accounts = useAccounts();
  const { dispatch } = useStore();
  const [pendingDelete, setPendingDelete] = React.useState<SocialAccount | null>(null);

  const groups: { platform: Platform; rows: SocialAccount[] }[] = [
    { platform: "instagram", rows: accounts.filter((a) => a.platform === "instagram") },
    { platform: "threads", rows: accounts.filter((a) => a.platform === "threads") },
  ];

  const toggle = (a: SocialAccount, connected: boolean) => {
    dispatch({ type: "account.setConnected", id: a.id, connected });
    toast(connected ? `Connected @${a.handle.replace(/^@/, "")}` : `Disconnected @${a.handle.replace(/^@/, "")}`);
  };

  const sync = () => {
    toast("Syncing… (connect Meta in Integrations to pull live data)");
  };

  return (
    <div className="reveal space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Accounts</h1>
          <p className="text-sm text-muted-foreground">
            Connect and manage your Instagram and Threads profiles.
          </p>
        </div>
        <AddAccountDialog onAdd={(a) => dispatch({ type: "account.upsert", account: a })} />
      </div>

      {/* Explainer */}
      <Card className="border-border/60 bg-accent/30">
        <CardContent className="flex items-start gap-3 py-4">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-brand" />
          <div className="space-y-1">
            <p className="text-sm font-medium">Live connections happen through Meta</p>
            <p className="text-xs text-muted-foreground">
              Real account linking runs via the Meta OAuth flow in the{" "}
              <span className="font-medium text-foreground">Integrations</span> admin panel (key-guarded). Accounts
              added here are tracked locally until you authorize live access.
            </p>
          </div>
        </CardContent>
      </Card>

      {accounts.length === 0 ? (
        <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border/60 bg-card/50 py-12 text-center">
          <Plug className="size-8 text-muted-foreground/60" />
          <div className="space-y-1">
            <p className="text-sm font-medium">No accounts yet</p>
            <p className="text-xs text-muted-foreground">Add your first Instagram or Threads profile to get started.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {groups.map(({ platform, rows }) => {
            const { label, icon: Icon } = platformMeta[platform];
            return (
              <section key={platform} className="space-y-3">
                <div className="flex items-center gap-2">
                  <Icon className="size-4 text-muted-foreground" />
                  <h2 className="text-sm font-semibold">{label}</h2>
                  <Badge variant="secondary" className="font-normal">
                    {rows.length}
                  </Badge>
                </div>
                {rows.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-border/60 px-4 py-6 text-center text-xs text-muted-foreground">
                    No {label} accounts yet.
                  </p>
                ) : (
                  <div className={cn("grid gap-3", "sm:grid-cols-2")}>
                    {rows.map((a) => (
                      <AccountCard
                        key={a.id}
                        account={a}
                        onToggle={(c) => toggle(a, c)}
                        onSync={sync}
                        onDelete={() => setPendingDelete(a)}
                      />
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}

      <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this account?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete ? (
                <>
                  This removes <span className="font-medium">@{pendingDelete.handle.replace(/^@/, "")}</span> from your
                  workspace. This can&apos;t be undone.
                </>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => {
                if (pendingDelete) {
                  dispatch({ type: "account.delete", id: pendingDelete.id });
                  toast("Account removed");
                }
                setPendingDelete(null);
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
