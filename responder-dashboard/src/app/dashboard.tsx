"use client";
import React, { useState, useEffect } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import Sidebar from "@/components/sidebar";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import Chat from "@/components/chat";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Utility function to map priority to color classes
const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "0":
      return "bg-red-500"; // Critical priority
    case "1":
      return "bg-orange-500"; // High priority
    case "2":
      return "bg-yellow-500"; // Medium priority
    case "3":
      return "bg-purple-500"; // Low priority
    case "4":
      return "bg-teal-500"; // Very low priority
    default:
      return "bg-gray-300"; // Default color
  }
};

export function Dashboard() {
  // State to store call details
  const [callDetails, setCallDetails] = useState<any[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<any | null>(null); // State for selected incident

  // Fetch call details from the server or API route
  useEffect(() => {
    async function fetchData() {
      try {
        // const response = await fetch('/api/webhook')  // Fetch existing incidents from API route
        const response = await fetch(
          "https://ec1e-2607-b400-26-0-3138-afdd-701a-b933.ngrok-free.app/api/webhook"
        ); // Fetch existing incidents from API route
        if (response.ok) {
          const data = await response.json();

          // Map data to extract only necessary fields
          const simplifiedData = data.map((incident: any) => ({
            who: incident.caller_info.name,
            what: incident.incident_details.incident_type,
            when: incident.incident_details.time,
            priority: incident.incident_details.priority_level.toString(),
            description: incident.incident_details.description_of_events,
            fullData: incident, // Store full data for detailed view
          }));

          setCallDetails(simplifiedData); // Update state with simplified data
          console.log("Fetched simplified data:", simplifiedData); // Log for debugging
        } else {
          console.error("Error fetching data:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }

      // Set up polling to call fetchData every 5 seconds (5000 milliseconds)
      // const intervalId = setInterval(fetchData, 5000);

      // // Fetch data initially when the component mounts
      // fetchData();

      // // Clean up interval when the component unmounts
      // return () => clearInterval(intervalId);
    }
    fetchData(); // Initial fetch
  }, []);

  return (
    <TooltipProvider>
      <div className="grid h-screen w-full pl-[56px]">
        <Sidebar />
        <div className="flex flex-col w-full">
          <ResizablePanelGroup direction="horizontal">
            {/* Left Panel with 1/3 width */}
            <ResizablePanel className="flex justify-center items-start w-1/3">
              <div className="w-[80%] flex flex-col space-y-4">
                {callDetails.map((details, index) => {
                  const [date, time] = details.when.split("T"); // Split date and time
                  return (
                    <Card
                      key={index}
                      className="w-full h-40 relative overflow-hidden cursor-pointer"
                      onClick={() => setSelectedIncident(details.fullData)} // Handle card click
                    >
                      <CardHeader className="relative">
                        <div className="flex items-center">
                          <CardTitle>{details.who}</CardTitle>
                          <span
                            className={`inline-block ml-2 text-white text-sm font-bold rounded-full h-6 w-6 flex items-center justify-center ${getPriorityColor(
                              details.priority
                            )}`}
                          >
                            {details.priority}
                          </span>
                        </div>
                        <div className="absolute top-0 right-0 text-sm text-gray-500 p-2 flex flex-col items-end">
                          <div>{date}</div>
                          <div className="text-right">{time}</div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-1">{details.what}</div>
                        <div className="mb-1">{details.description}</div>
                      </CardContent>
                      <CardFooter className="absolute bottom-2 right-2">
                        <Button className="w-full hover:bg-green-700" size="sm">
                          Respond
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            </ResizablePanel>
            <ResizableHandle />
            {/* Right Panel with 2/3 width */}
            <ResizablePanel className="flex items-start w-2/3">
              <div className="w-full">
                {selectedIncident ? (
                  <Chat incident={selectedIncident} />
                ) : (
                  <p>Select an incident to view details</p>
                )}
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    </TooltipProvider>
  );
}
