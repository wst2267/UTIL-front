"use client";
import React, {ChangeEvent, ChangeEventHandler, use, useEffect, useState} from "react";
import {
  BankOutlined,
  MehFilled,
  BookOutlined,
  FileAddOutlined,
} from "@ant-design/icons";
import {
  Col,
  Row,
  Card,
  Typography,
  Statistic,
  Calendar,
  Select,
  Radio,
  Button,
  Modal,
  Form,
  Input,
  FormProps,
  CalendarProps,
  BadgeProps,
  Badge,
  Spin,
  Table,
  Tag
} from "antd";
import {Dayjs} from "dayjs";
import dayjs from "dayjs";
import axios from "axios";
import type { TableProps } from 'antd';

type AddLedgerType = {
  type?: string;
  name?: string;
  value?: string;
};

type LoginType = {
  username?: string
}


export default function LedgerPage() {
  const {Text} = Typography;
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isRenderCell, setIsRenderCell] = useState<boolean>(false)
  const [selectedDate, setSelectedDate] = useState(() => dayjs(new Date()));
  const [selectedValueCalendar, setSelectedValueCalendar] = useState(() =>
    dayjs(new Date())
  );
  const [totalIncome, setTotalIncome] = useState<number>(0);
  const [totalExpenses, setTotalExpenses] = useState<number>(0);
  const [remaining, setRemaining] = useState<number>(0);
  const [isLogin, setIsLogin] = useState<boolean>(false)
  const [username, setUsername] = useState<string>("")
  const _monthNameThai = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ];
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [dataGetinDB, setDataGetInDB] = useState<any>({});
  const [datasource, setDatasource] = useState<any>([]);
  //test
  useEffect(() => {
    if (isLogin == true) {
      GetDataLedger(username);
    }
    else {
      openUserModal();
    }
  }, [isLogin]);

  async function GetDataLedger(username: string) {
    setIsLoading(true)
    var ledger = await axios.get(`https://util-api-lb2y.onrender.com/api/ledger/getledger?userName=${username}`);
    if (ledger.data != null) {
      setDataGetInDB(ledger.data)

      getTableData(selectedDate.format("YYYY-MM-DD"), ledger.data)
      calculateTotal(selectedDate.format("YYYY-MM-DD"), ledger.data)
      setIsLoading(false)
    }
  }

  const getTableData = (date: string, tableData: any) => {
    var datasource: any[] = []
    var index: number = 1;
    var filterData = tableData.filter((x: any) => dayjs(x.ledgerDate).get('month') == dayjs(date).month() && dayjs(x.ledgerDate).get('year') == dayjs(date).year())
    if (filterData.length == 0) {
      setDatasource([])
      return;
    }
    console.log("filterData:", filterData)

    filterData.forEach((element: any) => {
      element.ledgerDetails.forEach((detail: any) => {
        var data = {
          key: (index).toLocaleString(),
          ledgerNote: `${detail.ledgerNote}`, 
          ledgerValue: `${detail.ledgerValue.toLocaleString().replace(/\d(?=(\d{3})+\.)/g, '$&,')} บาท`,
          tag: [ detail.ledgerType ] 
        }
        datasource.push(data)
        index += 1;
      });
      setDatasource(datasource)
    })
  }

  const columns: TableProps<any>['columns'] = [
    {
      title: 'รายการ',
      dataIndex: 'ledgerNote',
      key: 'ledgerNote'
    },
    {
      title: 'จำนวน',
      dataIndex: 'ledgerValue',
      key: 'ledgerValue'
    },
    // {
    //   title: 'ประเภท',
    //   dataIndex: 'ประเภท',
    //   key: 'tag',
    //   render: (_, {tag}) => {
    //     return <>
    //       {tag.map((t: any) => {
    //         let color = "";
    //         let typeName = ""
    //         if (t == "income") {
    //           color = "#87d068"
    //           typeName = "รายรับ"
    //         }
    //         else {
    //           color = '#f50';
    //           typeName = "รายจ่าย"
    //         }
    //         return (
    //           <Tag color={color} key={tag}>
    //             {typeName}
    //           </Tag>
    //         );
    //       })}
    //     </>;
    //   }
    // },
  ]

  const openUserModal = () => {
    Modal.info({
      title: 'Please input Username',
      content: (
        <div>
          User name: <Input type="input" onChange={onUsernameChange}></Input>
        </div>
      ),
      onOk() {
        setIsLogin(true)
      },
    });
  }

  const onUsernameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value)
  }

  const calculateTotal = (date: string, data: any) => {
    var income = 0;
    var expenses = 0;
    if (data != null) {
        var filterData = data.filter((x: any) => dayjs(x.ledgerDate).get('month') == dayjs(date).month() && dayjs(x.ledgerDate).get('year') == dayjs(date).year())
        filterData.forEach((ledger: any) => {
            ledger.ledgerDetails.forEach((ledgernote: any) => {
                if (ledgernote.ledgerType == "income") {
                    income += Number(ledgernote.ledgerValue)
                }
                else if (ledgernote.ledgerType == "expenses") {
                    expenses += Number(ledgernote.ledgerValue)
                }
            });
        });
        setTotalIncome(income)
        setTotalExpenses(expenses)
        setRemaining(income - expenses)
    }

  }

  const showAddModal = () => {
    setIsAddModalOpen(true);
  };

  const handleCancel = () => {
    setIsAddModalOpen(false);
  };

  const onAddNewLedger: FormProps<AddLedgerType>['onFinish'] = async(values) => {
    setIsRenderCell(true)
    //console.log('Success:', values);
    //console.log("onSelect asasasas: ", selectedDate.format("YYYY-MM-DD"));

    // call save api
    var transformData = {
      ledgerDate: selectedDate.format("YYYY-MM-DD") ?? "",
      ledgerType: values.type ?? "",
      ledgerNote: values.name ?? "",
      ledgerValue: Number(values.value)
    }
    await AddNewLedger(transformData);

    calculateTotal(selectedDate.format("YYYY-MM-DD"), dataGetinDB)

    //close 
    setIsAddModalOpen(false)
  };

  async function AddNewLedger(data: any) {
    await axios.post(`https://util-api-lb2y.onrender.com/api/ledger/upsert/${username}`, data)
        .then(response => {
          if (response.status == 200) {
            GetDataLedger(username);
          }
        })
  }

  const onSelect = (newValue: Dayjs) => {
    setIsRenderCell(false)
    //console.log("onSelect: ", newValue.format("YYYY-MM-DD"));
    setSelectedDate(newValue);
    setSelectedValueCalendar(newValue);
  };

  const onPanelChange = (newValue: Dayjs) => {
    setSelectedDate(newValue);
    //console.log("onPanelChange: ", newValue.format("YYYY-MM-DD"));
    calculateTotal(newValue.format("YYYY-MM-DD"), dataGetinDB)
    console.log("dataGetinDB: ", dataGetinDB)
    getTableData(newValue.format("YYYY-MM-DD"), dataGetinDB)
  };

  const getListData = (value: Dayjs) => {
    let listData: { type: string; content: string }[] = []; // Specify the type of listData

    if (Object.keys(dataGetinDB).length === 0) {
        return undefined;
    }

    {dataGetinDB.forEach((data: any) => {
        if (value.format("YYYY-MM-DD") == dayjs(data.ledgerDate).format("YYYY-MM-DD")) {
            var details = [];
            data.ledgerDetails.forEach((ledgernote: any) => {
                var newDetail = {
                    type: ledgernote.ledgerType == "income" ? "success" : "error",
                    content: ledgernote.ledgerNote + " " + ledgernote.ledgerValue.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,') + " บาท"
                }
                listData.push(newDetail)
            });
            
        }
    })};
    
    return listData || [];
  };

  const dateCellRender = (value: Dayjs) => {
    const listData = getListData(value);
    if (listData == undefined) {
        return;
    }

    return (
      <ul className="events">
        {listData.map((item: any) => (
          <li key={item.content}>
            <Badge status={item.type as BadgeProps['status']} text={item.content} />
          </li>
        ))}
      </ul>
    );
  };

  const cellRender: CalendarProps<Dayjs>['cellRender'] = (current, info) => {
    if (info.type === 'date') return dateCellRender(current);
    //if (info.type === 'month') return monthCellRender(current);
    return info.originNode;
  };

  return (
    <>
    <Spin spinning={isLoading}>
    <Row gutter={{xs: 8, sm: 16, md: 24, lg: 2}}>
        <Col xs={24} sm={24} md={8} lg={8} xl={8} span={8}>
          <Card bordered={false}>
            <Statistic
              title="รายรับ"
              value={totalIncome}
              precision={2}
              valueStyle={{color: "#3f8600"}}
              prefix={<BankOutlined />}
              suffix="บาท"
            />
          </Card>
        </Col>
        <Col xs={24} sm={24} md={8} lg={8} xl={8} span={8}>
          <Card bordered={false}>
            <Statistic
              title="รายจ่าย"
              value={totalExpenses}
              precision={2}
              valueStyle={{color: "#EA3710"}}
              prefix={<MehFilled />}
              suffix="บาท"
            />
          </Card>
        </Col>
        <Col xs={24} sm={24} md={8} lg={8} xl={8} span={8}>
          <Card bordered={false}>
            <Statistic
              title="คงเหลือ"
              value={remaining}
              precision={2}
              valueStyle={{color: "#D8D42F"}}
              prefix={<BookOutlined />}
              suffix="บาท"
            />
          </Card>
        </Col>
      </Row>
      <Row gutter={{xs: 8, sm: 16, md: 24, lg: 2}} style={{paddingTop: "10px"}}>
        <Col xs={24} sm={24} md={24} lg={24} xl={24} span={24}>
          <Calendar
            value={selectedDate}
            onSelect={onSelect}
            onPanelChange={onPanelChange}
            cellRender={cellRender}
            headerRender={({value, type, onChange, onTypeChange}) => {
              const start = 0;
              const end = 12;
              const monthOptions = [];

              let current = value.clone();
              const months = [];
              for (let i = 0; i < 12; i++) {
                current = current.month(i);
                months.push(_monthNameThai[i]);
              }

              for (let i = start; i < end; i++) {
                monthOptions.push(
                  <Select.Option key={i} value={i} className="month-item">
                    {months[i]}
                  </Select.Option>
                );
              }

              const year = value.year();
              const month = value.month();
              const options = [];
              for (let i = year - 10; i < year + 10; i += 1) {
                options.push(
                  <Select.Option key={i} value={i} className="year-item">
                    {i}
                  </Select.Option>
                );
              }
              return (
                <div style={{padding: 8}}>
                  <Button
                    type="primary"
                    style={{marginBottom: "10px"}}
                    icon={<FileAddOutlined />}
                    onClick={showAddModal}>
                    Add
                  </Button>
                  <Row gutter={8}>
                    <Col>
                      <Radio.Group
                        size="small"
                        onChange={(e) => onTypeChange(e.target.value)}
                        value={type}>
                        <Radio.Button value="month">Month</Radio.Button>
                        {/* <Radio.Button value="year">Year</Radio.Button> */}
                      </Radio.Group>
                    </Col>
                    <Col>
                      <Select
                        size="small"
                        className="my-year-select"
                        value={year}
                        onChange={(newYear) => {
                          const now = value.clone().year(newYear);
                          onChange(now);
                        }}>
                        {options}
                      </Select>
                    </Col>
                    <Col>
                      <Select
                        size="small"
                        value={month}
                        onChange={(newMonth) => {
                          const now = value.clone().month(newMonth);
                          onChange(now);
                        }}>
                        {monthOptions}
                      </Select>
                    </Col>
                  </Row>
                </div>
              );
            }}
          />
        </Col>
      </Row>

      <Row gutter={{xs: 8, sm: 16, md: 24, lg: 2}}>
        <Col xs={24} sm={24} md={24} lg={24} xl={24} span={24}>
          <Table columns={columns} dataSource={datasource}
          rowClassName={(record, index) => {
            if (record.tag == "income") {
              return "bg-green-500"
            }
            else {
              return "bg-red-500"
            }
          }}
          />
        </Col>
      </Row>
    </Spin>
      

      <Modal
        title="Add"
        open={isAddModalOpen}
        onCancel={handleCancel}
        destroyOnClose={true}
        footer={null}>
        <Form
          labelCol={{span: 8}}
          wrapperCol={{span: 16}}
          style={{maxWidth: 600}}
          onFinish={onAddNewLedger}
          layout="horizontal">
          <Form.Item<AddLedgerType>
            label="ประเภท"
            name="type"
            rules={[{required: true, message: "กรุณาเลือก ประเภท!"}]}>
            <Select>
              <Select.Option value="income">รายรับ</Select.Option>
              <Select.Option value="expenses">รายจ่าย</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item<AddLedgerType>
            label="รายการ"
            name="name"
            rules={[{required: true, message: "กรุณากรอก ชื่อรายการ!"}]}>
            <Input />
          </Form.Item>
          <Form.Item<AddLedgerType>
            label="จำนวน"
            name="value"
            rules={[{required: true, message: "กรุณากรอก จำนวน!"}]}>
            <Input />
          </Form.Item>
          <Form.Item wrapperCol={{offset: 8, span: 16}}>
            <Button type="primary" htmlType="submit">
              Save
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
