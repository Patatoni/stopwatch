//Author: Aboom
import { useState, useEffect } from "react";
import { Searchbox } from "../components/Searchbox";
import { VideoCard } from "../components/VideoCard";
import { VideoCardsCarousel } from "../components/VideoCardsCarousel";
import { EventHeader } from "../components/EventHeader";
import { ErrorAlert } from "../components/ErrorAlert";
import BeatLoader from "react-spinners/BeatLoader";
import axios from "axios";
import React from "react";

interface Recording {
  id: number;
  path: string;
  name: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
  duration: string;
  size: number;
  eventId: number;
}

export interface Event {
  id: number;
  recordings: Recording[];
  channel: number;
  name: string;
  startDateTime: string;
  endDateTime: string;
}

const getEvents = async () => {
  try {
    const response = await axios.get("http://localhost/api/getEvents");
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const EventList = () => {
  const [eventList, setEventList] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | Error>(null);
  const [singleEvent, setSingleEvent] = useState<Event | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await getEvents();
        setEventList(data);
      } catch (e) {
        setError(e as Error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleSearch = (searchTerm: string) => {
    const numericSearchTerm = searchTerm.replace(/\D/g, '');

    if (!isNaN(parseInt(numericSearchTerm,   10))) {
      const foundEvent = eventList.find(event => event.id === parseInt(numericSearchTerm,   10));
   
      if (foundEvent) {
        setSingleEvent(foundEvent);
      } else {
        setSingleEvent(null);
      }
    } else {
      setSingleEvent(null);
    }
  };

  if (error) {
    return (
      <>
        <Searchbox datepickerIcon key="Searchbox" onSearch={handleSearch} />
        <ErrorAlert errorMessage="Al momento non è  possibile caricare i dati." />
      </>
    );
  }

  if (singleEvent) {
    return (
      <>
        <Searchbox datepickerIcon key="Searchbox" onSearch={handleSearch} />
        <EventHeader
          id={singleEvent.id}
          recordingCount={singleEvent.recordings.length}
          startDateTime={singleEvent.startDateTime}
          endDateTime={singleEvent.endDateTime}
          channel={singleEvent.channel}
        />
        <VideoCardsCarousel>
          {singleEvent.recordings.map((recording) => (
            <VideoCard
              key={`c-${singleEvent.id} recording-${recording.id}`}
              id={recording.id}
              description={
                recording.description === ""
                  ? "Questo video non ha una descrizione."
                  : recording.description
              }
              startDateTime={recording.startDateTime}
              endDateTime={recording.endDateTime}
              duration={recording.duration}
              size={recording.size}
              name={recording.name}
            />
          ))}
        </VideoCardsCarousel>
      </>
    );
  } else {
    return (
      <>
        <Searchbox datepickerIcon key="Searchbox" onSearch={handleSearch} />
        {eventList
          .sort((a, b) => b.id - a.id)
          .map((data: Event, index: number) => (
            <React.Fragment key={`event-${data.id}`}>
              <EventHeader
                id={data.id}
                recordingCount={data.recordings.length}
                startDateTime={data.startDateTime}
                endDateTime={data.endDateTime}
                channel={data.channel}
              />
              <VideoCardsCarousel>
                {data.recordings.map((recording) => (
                  <VideoCard
                    key={`c-${data.id} recording-${recording.id}`}
                    id={recording.id}
                    description={
                      recording.description === ""
                        ? "Questo video non ha una descrizione."
                        : recording.description
                    }
                    startDateTime={recording.startDateTime}
                    endDateTime={recording.endDateTime}
                    duration={recording.duration}
                    size={recording.size}
                    name={recording.name}
                  />
                ))}
              </VideoCardsCarousel>
              {index !== eventList.length -  1 && (
                <hr className="lg:mx-20 md:mx-10 sm:mx-5 mb-10 mt-10" />
              )}
            </React.Fragment>
          ))}
        <BeatLoader
          className="text-center my-20"
          color="#eab308"
          loading={loading}
        />
      </>
    );
  }
};