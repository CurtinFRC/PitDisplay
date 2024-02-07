"use client";

import * as React from "react"

import Image from "next/image";

import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons"
 
import { GetMatches, GetRankings, GetTeamData, cn } from "@/lib/utils"
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

import { AiOutlineGlobal } from "react-icons/ai";
import { FaHome } from "react-icons/fa";

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
import { RiTeamFill } from "react-icons/ri";

import { GetEvents } from "@/lib/utils";
import { Card } from "@/components/ui/card";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch";
import { global } from "styled-jsx/css";

import io from 'socket.io-client';

import { initializeApp } from "firebase/app";

import { getDatabase, onValue, ref, remove, set } from "firebase/database";
import { Badge } from "@/components/ui/badge";

import { getStorage, ref as storage_ref, getDownloadURL } from "firebase/storage";

//import { RawServer } from "../../../Waterbase/libraries/ts/src";

import { firebaseConfig } from "@/lib/firebase";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState("")
  
  const [events, setEvents] = React.useState([]);
  
  const [setup, setSetup] = React.useState(false);
  
  const [currentEvent, setCurrentEvent] = React.useState("");
  const [eventNameToKey, setEventNameToKey] = React.useState({});
  
  const [teamData, setTeamData] = React.useState(null);
  const [canSetTeamData, setCanSetTeamData] = React.useState(true);
  
  const [matches, setMatches] = React.useState([]);
  const [canGetMatches, setCanGetMatches] = React.useState(true);
  
  const [teamNumber, setTeamNumber] = React.useState(0);

  const [strategy, setStrategy] = React.useState('');
  const [tasks, setTasks] = React.useState([]);

  const [strats_image_url, set_strats_image_url] = React.useState('');

  const VERSION = "0.0.1";
  const YEAR = 2023;
  
  const app = initializeApp(firebaseConfig);
  const database = getDatabase();
  const storage = getStorage();

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
      //console.log(events);
      
      setSetup(true);
    });
    

    
  }

  function GetTeamEventData() {
    if (teamNumber > 0) {
       GetTeamData(teamNumber, currentEvent).then((data) => {
        setTeamData(data);
      })
    
      onValue(ref(database, 'tasks/'), (snapshot) => {
        if (snapshot.val() == null) {
          setTasks([]);
          return;
        }

        // get all of the object keys
        let ids: string[] = Object.keys(snapshot.val());

        let t: any[] = Object.values(snapshot.val());
        if (snapshot.val() == 'null') {
          t = [];
        }

        for (let i = 0; i < t.length; i++) {
          if (t[i].tags == 'null' || !t[i].tags) {
            t[i].tags = [];
          }

          t[i].id = ids[i];
        }
        setTasks(t);
      })

      onValue(ref(database, 'strategy/'), (snapshot) => {
        setStrategy(snapshot.val());
      })

      getDownloadURL(storage_ref(storage, 'strategy_image.png')).then((url) => {set_strats_image_url(url)});
    }
      
    //fetch("http/data?token=test", {
      
    //}).then((resp) => {
      //  console.log(resp)
      //});

      //try {
      //server.get("data").then((resp) => {
        //setTasks(resp);
      //})
      //} catch (e) {
        //console.log(e);
        //setTasks(e.toString());
      //}
      //})
       
  } 

  if (canSetTeamData) {
    setCanSetTeamData(false);
    
    GetTeamEventData();

    setTimeout(() => {
      setCanSetTeamData(true);
    }, 10000)
  }

  function GetAllMatches() {
    GetMatches(currentEvent).then((_matches) => {
      //let time = Date.now();
      let time = 0;

      // Filter out matches that have already happened

      _matches = _matches.filter((match) => {
        let matchTime = new Date(match.time).getTime();

        //console.log(matchTime, time);

        return matchTime > time;
      });

      // filter out matches that are not part of our team
      _matches = _matches.filter((match) => {
        let redTeam = match.alliances.red.team_keys;
        let blueTeam = match.alliances.blue.team_keys;

        console.log(redTeam, blueTeam, teamNumber)

        return redTeam.includes("frc" + teamNumber) || blueTeam.includes("frc" + teamNumber);
      });

      // sort by time

      _matches.sort((a, b) => {
        return a.time - b.time;
      });

      setMatches(_matches);
    })
  }
  
  if (canGetMatches) {
    setCanGetMatches(false);
    
    GetAllMatches();

    setTimeout(() => {
      setCanGetMatches(true);
    }, 10000);
  }

  function CompleteTask(task: string) {
    // remove tasks/{task} from db
 
    onValue(ref(database, 'tasks/' + task), (snapshot) => {
      remove(ref(database, 'tasks/' + task));

      set(ref(database, 'completedTasks/' + task), snapshot.val());
    });
  }

  //console.log(currentEvent)
  //console.log("rankings", rankings)
  //console.log(matches);
  //console.log(teamNumber);
  console.log("data", teamData);

  return (
    <div className="overallGrid">
      <Card className="m-4">
      <NavigationMenu className="m-4 nav min-w-[100%]">
        <NavigationMenuList className="nav-spacing">
          <NavigationMenuItem className="min-w-[20vw] max-w-[20vw]">
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

          <NavigationMenuItem className="min-w-[15vw]">
              <Link className="flex flex-row justify-center min-w-[9vw]" href="/" legacyBehavior passHref>
              <NavigationMenuLink className={"min-w-[8vw] " + navigationMenuTriggerStyle()}>
                  <AiOutlineGlobal className="m-auto" />  
                  <Label className="m-auto mr-3">Global</Label>
                </NavigationMenuLink>
              </Link>
          </NavigationMenuItem >
          
          <NavigationMenuItem className="min-w-[15vw]">
              <Label>Team Number</Label>
            <Input className="min-w-[15vw]" type="number" value={teamNumber} onChange={(e) => {setTeamNumber(e.target.value); GetTeamEventData(); GetAllMatches();}} />
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      </Card>
     <Card className="m-5 min-h-[82vh] max-h-[82vh] mt-0 mainGrid p-5"> 
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

      <Card className="rightGrid p-5">
        <Card className="p-3 max-h-[100%] strategy">
          <Card className="overflow-hidden"><Image src={strats_image_url} alt="stratagy image" width="3840" height="1556"/></Card>
          <Card className="p-2">
              {strategy.split('\n').map((line) => (
                <div>
                  <Label>{line}
                  </Label>
                </div>
              ))}
          </Card>
        </Card>

        <Card className="p-3 min-h-[100%] max-h-[100%] tasks no-scrollbar">
          
          {tasks != 'null' || tasks != null || tasks.length != 0 ? tasks.map((task) => (
            <Card className="p-3 taskGrid task flex flex-col overflow-scroll no-scrollbar mb-[40%] max-h-[105%] min-h-[105%]">
              <Card className="flex flex-row items-center text-left p-2 gap-2"> 
                {task.tags.map((tag) => (<Badge variant={tag.style}>{tag.text}</Badge>))}
                <Label>{task.name}</Label> 
              </Card>
              <Card className="p-2">
                <Label>{task.desc}</Label>
              </Card>
                <Button variant="outline" colorScheme="teal" onClick={() => {CompleteTask(task.id)}}>Complete</Button>
            </Card>
            )) : <Label>Fetching Tasks</Label>}
            
        </Card>

          {teamData && teamData.Error == undefined ? (
            <Card
            className={`m-auto min-w-[100%] tasks min-h-[100%] max-h-[100%] text-center flex flex-col gap-y-[1.5vh] p-3 ${
              teamData.qual.ranking.rank === 1 ? 'bg-amber-500' : teamData.qual.ranking.rank === 2 ? 'bg-gray-400' : teamData.qual.ranking.rank === 3 ? 'bg-orange-600' : ''
            }`}
          >
            <Label>{teamNumber.toString()}</Label>
            <Label>Wins: {teamData.qual.ranking.record.wins}</Label>
            <Label>Losses: {teamData.qual.ranking.record.losses}</Label>
            <Label>Draws: {teamData.qual.ranking.record.ties}</Label>
            <Label>Rank: {teamData.qual.ranking.rank}</Label>
            </Card>
          ) : <Card className="p-3"><Label>Getting Rank</Label></Card>} 
      </Card>
     </Card>
    </div>
  );
}

