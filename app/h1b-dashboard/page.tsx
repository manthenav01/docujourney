
"use client";

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const H1BDashboardPage = () => {
    const [topEmployers, setTopEmployers] = useState([]);
    const [caseStatusData, setCaseStatusData] = useState([]);
    const [year, setYear] = useState('2025');
    const [quarter, setQuarter] = useState('1');
    const [topN, setTopN] = useState('10');
    const [filterType, setFilterType] = useState('employer_name');

    useEffect(() => {
        fetchData();
    }, [year, quarter, topN, filterType]);

    const fetchData = async () => {
        const response = await fetch(`/api/h1b-data?year=${year}&quarter=${quarter}&topN=${topN}&filterType=${filterType}`);
        const data = await response.json();
        setTopEmployers(data.topEmployers);
        setCaseStatusData(data.caseStatusData);
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">H1B Visa Dashboard</h1>
                <p className="text-slate-600 mt-2">Insights from BigQuery</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Select value={year} onValueChange={setYear}>
                    <SelectTrigger>
                        <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="2025">2025</SelectItem>
                        <SelectItem value="2024">2024</SelectItem>
                        <SelectItem value="2023">2023</SelectItem>
                        <SelectItem value="2022">2022</SelectItem>
                        <SelectItem value="2021">2021</SelectItem>
                        <SelectItem value="2020">2020</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={quarter} onValueChange={setQuarter}>
                    <SelectTrigger>
                        <SelectValue placeholder="Quarter" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="1">Q1</SelectItem>
                        <SelectItem value="2">Q2</SelectItem>
                        <SelectItem value="3">Q3</SelectItem>
                        <SelectItem value="4">Q4</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={topN} onValueChange={setTopN}>
                    <SelectTrigger>
                        <SelectValue placeholder="Top N" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="10">Top 10</SelectItem>
                        <SelectItem value="20">Top 20</SelectItem>
                        <SelectItem value="50">Top 50</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger>
                        <SelectValue placeholder="Filter Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="employer_name">Employers</SelectItem>
                        <SelectItem value="job_title">Job Titles</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Top {topN} {filterType === 'employer_name' ? 'Employers' : 'Job Titles'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={topEmployers} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis type="category" dataKey="name" width={150} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="count" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>LCA Case Status Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={400}>
                            <LineChart data={caseStatusData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="CERTIFIED" stroke="#82ca9d" />
                                <Line type="monotone" dataKey="DENIED" stroke="#ff0000" />
                                <Line type="monotone" dataKey="WITHDRAWN" stroke="#8884d8" />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default H1BDashboardPage;
