"use client";

import * as React from "react"

import Image from "next/image";

import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons"
 
import { GetMatches, GetRankings, cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu"
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { IoMdSettings } from "react-icons/io";

import { GetEvents } from "@/lib/utils";
import { Card } from "@/components/ui/card";
export default function Home() {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState("")
  
  const [events, setEvents] = React.useState([]);
  
  const [setup, setSetup] = React.useState(false);
  
  const [currentEvent, setCurrentEvent] = React.useState("");
  const [eventNameToKey, setEventNameToKey] = React.useState({});
  
  const [rankings, setRankings] = React.useState({rankings: []});
  const [canGetRankings, setCanGetRankings] = React.useState(true);
  
  const [matches, setMatches] = React.useState([]);
  const [canGetMatches, setCanGetMatches] = React.useState(true);

  const VERSION = "0.0.1";
  const YEAR = 2023;
  
  //setCurrentEvent("2023ausc");

  interface Team {
    name: string;
    num: number;
  };

  interface Match {
    name: number;
    redScore: number;
    blueScore: number;
    redTeams: Array<Team>;
    blueTeams: Array<Team>;
  };

  //let matches = [{}, {}, {}, {}, {}, {}];
 
  //var events: any[] = [];
  if (!setup) {
    setSetup(true);
    setCurrentEvent("2023ausc");
     
    GetEvents(YEAR).then((total_events) => {
      let temp_events = [];
      let temp_eventNameToKey = [];

      for (let i = 0; i<total_events.length; i++) {
        let e = total_events[i];
        temp_events.push({
          label: e.name,
          value: e.name.toLowerCase(),
          key: e.key
        })

        temp_eventNameToKey[e.name.toLowerCase()] = e.key;
      }

      setEvents(temp_events);
      setEventNameToKey(temp_eventNameToKey);
      console.log(events);
      
      setSetup(true);
    });
    

    
  }

  if (canGetRankings) {
    setCanGetRankings(false);
    
    GetRankings(currentEvent).then((ranks) => {
      setRankings(ranks);
    })
    

    setTimeout(() => {
      setCanGetRankings(true);
    }, 10000)
  }
  
  if (canGetMatches) {
    setCanGetMatches(false);
    
    GetMatches(currentEvent).then((_matches) => {
      //let time = Date.now();
      let time = 0;
      // Filter out matches that have already happened

      _matches = _matches.filter((match) => {
        let matchTime = new Date(match.time).getTime();

        console.log(matchTime, time);

        return matchTime > time;
      });

      // sort by time

      _matches.sort((a, b) => {
        return a.time - b.time;
      });

      setMatches(_matches);
    })
    

    setTimeout(() => {
      setCanGetMatches(true);
    }, 10000);
  }

  console.log(currentEvent)
  console.log("rankings", rankings)
  console.log(matches);

  return (
    <div className="overallGrid">
      <Card className="m-4">
      <NavigationMenu className="m-4 nav min-w-[100%]">
        <NavigationMenuList className="nav-spacing">
          <NavigationMenuItem className="min-w-[20vw]">
            <div className="flex flex-col space-y-4">
              <Label>Version {VERSION}</Label>
              <Label>Powered by <Link href="thebluealliance.com">thebluealliance.com</Link></Label>
            </div>
          </NavigationMenuItem>
          
          <NavigationMenuItem className="min-w-[20vw]">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="min-w-[100%] justify-between"
                >
                  {value
                    ? events.find((match) => match.value === value)?.label
                    : "Select Event..."}
                  <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="min-w-[20vw] p-0">
                <Command>
                  <CommandInput placeholder="Search match..." className="h-9" />
                  <CommandEmpty>No events found.</CommandEmpty>
                  <CommandGroup>
                    {events.map((match) => (
                      <CommandItem
                        key={match.key}
                        value={match.value}
                        onSelect={(currentValue) => {
                          setValue(currentValue === value ? "" : currentValue)
                          setCurrentEvent(eventNameToKey[currentValue])
                          setOpen(false)
                        }}
                      >
                        {match.label}
                        <CheckIcon
                          className={cn(
                            "ml-auto h-4 w-4",
                            value === match.value ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </NavigationMenuItem>

          <NavigationMenuItem className="min-w-[20vw]">
              <Link className="flex flex-row justify-between min-w-[10vw]" href="/settings" legacyBehavior passHref>
              <NavigationMenuLink className={"min-w-[10vw] " + navigationMenuTriggerStyle()}>
                <Label className="m-auto mr-3">Settings</Label>
                <IoMdSettings className="m-auto" />
                </NavigationMenuLink>
              </Link>
          </NavigationMenuItem >

        </NavigationMenuList>
      </NavigationMenu>
      </Card>
     <Card className="m-5 min-h-[82vh] mt-0 mainGrid p-5"> 
      <div className="cardGrid">
        {matches.length != 0 ? matches.slice(0, 6).map((match) => (
          <Card className="match p-2">
            <Card className="match-info">
                <Label>
                  Match {match.match_number}
                </Label>
            </Card>
            <Card className="match-info">
              <Label>
                {new Date(match.time * 1000).toLocaleTimeString()}
              </Label>
            </Card>

            <Card className="match-info bg-red-600 opacity-100 flex flex-col gap-y-[3vh]">
              {match.alliances.red.team_keys.map((team) => (
                  <Label>{team.substring(3)}</Label>
              ))} 
            </Card>
            <Card className="match-info bg-sky-600 opacity-100 flex flex-col gap-y-[3vh]">
              {match.alliances.blue.team_keys.map((team) => (
                  <Label>{team.substring(3)}</Label>
              ))}
            </Card>
          </Card>
        )) : <Label>Fetching Matches</Label>} 
      </div>

      <Card className="rankingsGrid p-5">
        {rankings.rankings.length != 0 ? rankings.rankings.slice(0, 4).map((team) => (
            
            <Card
            className={`m-auto min-w-[100%] min-h-[100%] text-center flex flex-col gap-y-[1.5vh] p-3 ${
              rankings.rankings.indexOf(team) === 0 ? 'bg-amber-500' : rankings.rankings.indexOf(team) === 1 ? 'bg-gray-400' : rankings.rankings.indexOf(team) === 2 ? 'bg-orange-600' : ''
            }`}
            key={team.team_key}
          >
            <Label>{team.team_key.substring(3)}</Label>
            <Label>Wins: {team.record.wins}</Label>
            <Label>Losses: {team.record.losses}</Label>
            <Label>Draws: {team.record.ties}</Label>
          </Card> 
        )) : <Label>Fetching Ranks</Label>} 
      </Card>
     </Card>
    </div>
  );
}

