import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function AllianceRequest(url: string) {
  let key: string | undefined = process.env.NEXT_PUBLIC_TBA_KEY;
  
  if (key == undefined) { throw new Error("No TBA key, define it in NEXT_PUBLIC_TBA_KEY") }

  return fetch("https://www.thebluealliance.com/api/v3" + url, {
    headers: {
      "X-TBA-Auth-Key": key
    }
  }).then((response) => {
    return response.json();
  });  
}

export async function GetTeamData(team: number, event: string) {
  if (event == "" || event == undefined || event == null) { return null; }

  return AllianceRequest("/team/frc" + team.toString() + "/event/" + event + "/status");
}
export async function GetMatches(event: string) {

  if (event == "" || event == undefined || event == null) { return []; }

  return AllianceRequest("/event/" + event + "/matches");
}

export async function GetRankings(event: string) {
  if (event == "" || event == undefined || event == null) { return {rankings: [] } }

  return AllianceRequest("/event/" + event + "/rankings");
}

export async function GetEvents(year: number) {
  return AllianceRequest("/events/" + year); 
}
