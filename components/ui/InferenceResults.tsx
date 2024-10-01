import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../Login/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface InferenceResultsProps {
  results: { [key: string]: any };
}

const InferenceResults: React.FC<InferenceResultsProps> = ({ results }) => {
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Inference Results</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          {Object.entries(results).map(([imageUrl, result]) => (
            <div key={imageUrl} className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Image: {imageUrl.split('/').pop()}</h3>
              {result.error ? (
                <p className="text-red-500">Error: {result.error}</p>
              ) : (
                <pre className="bg-gray-100 p-2 rounded overflow-x-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default InferenceResults;