import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const ProductSizeChart = () => {
  return (
    <div className="my-4">
      <Tabs defaultValue="adult" className="mt-2">
        <TabsList className="grid w-full max-w-xs mx-auto grid-cols-2 bg-white shadow-sm border mb-4">
          <TabsTrigger value="adult" className="data-[state=active]:bg-[#0e1924] data-[state=active]:text-white">Adult</TabsTrigger>
          <TabsTrigger value="kids" className="data-[state=active]:bg-[#f5963c] data-[state=active]:text-white">Kids</TabsTrigger>
        </TabsList>
        <TabsContent value="adult">
          <Card className="shadow-md border-primary-blue/20 animate-fade-in-up">
            <CardHeader>
              <CardTitle className="text-primary-blue text-lg">Adult Sizes</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption className="text-xs text-gray-500">Tip: For a looser fit, size up!</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Size</TableHead>
                    <TableHead>Chest</TableHead>
                    <TableHead>Length</TableHead>
                    <TableHead>Recommended Height</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow><TableCell>S</TableCell><TableCell>92</TableCell><TableCell>70</TableCell><TableCell>160-170</TableCell></TableRow>
                  <TableRow><TableCell>M</TableCell><TableCell>98</TableCell><TableCell>72</TableCell><TableCell>168-178</TableCell></TableRow>
                  <TableRow><TableCell>L</TableCell><TableCell>104</TableCell><TableCell>74</TableCell><TableCell>175-185</TableCell></TableRow>
                  <TableRow><TableCell>XL</TableCell><TableCell>110</TableCell><TableCell>76</TableCell><TableCell>182-192</TableCell></TableRow>
                  <TableRow><TableCell>XXL</TableCell><TableCell>116</TableCell><TableCell>78</TableCell><TableCell>190-200</TableCell></TableRow>
                  <TableRow><TableCell>3XL</TableCell><TableCell>122</TableCell><TableCell>80</TableCell><TableCell>198-210</TableCell></TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="kids">
          <Card className="shadow-md border-primary-orange/20 animate-fade-in-up">
            <CardHeader>
              <CardTitle className="text-primary-orange text-lg">Kids Sizes</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption className="text-xs text-gray-500">Age is approximate. Check height for best fit!</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Size</TableHead>
                    <TableHead>Chest</TableHead>
                    <TableHead>Length</TableHead>
                    <TableHead>Recommended Age</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow><TableCell>16</TableCell><TableCell>76</TableCell><TableCell>54</TableCell><TableCell>4-5</TableCell></TableRow>
                  <TableRow><TableCell>18</TableCell><TableCell>80</TableCell><TableCell>56</TableCell><TableCell>5-6</TableCell></TableRow>
                  <TableRow><TableCell>20</TableCell><TableCell>84</TableCell><TableCell>58</TableCell><TableCell>6-7</TableCell></TableRow>
                  <TableRow><TableCell>22</TableCell><TableCell>88</TableCell><TableCell>60</TableCell><TableCell>7-8</TableCell></TableRow>
                  <TableRow><TableCell>24</TableCell><TableCell>92</TableCell><TableCell>62</TableCell><TableCell>8-9</TableCell></TableRow>
                  <TableRow><TableCell>26</TableCell><TableCell>96</TableCell><TableCell>64</TableCell><TableCell>9-10</TableCell></TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <div className="mt-3 text-center text-xs text-gray-500 animate-fade-in-up delay-200">
        <span className="font-semibold text-primary-orange">Pro Tip:</span> Measure your favorite shirt and compare for the best fit!
      </div>
    </div>
  );
};