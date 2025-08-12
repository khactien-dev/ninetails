import React, { useEffect, useMemo, useState } from 'react';

import ERDComponent from './tabs-content/ERD';
import CongestionCode from './tabs-content/congestion_code';
import CoreSection from './tabs-content/core_section';
import Guide from './tabs-content/guide';
import GuideCode from './tabs-content/guide_code';
import Metadata from './tabs-content/metadata';
import Point from './tabs-content/point';
import Route from './tabs-content/route';
import Section from './tabs-content/section';
import Segments from './tabs-content/segment';
import SegmentRoutes from './tabs-content/segment_route';

type TargetKey = React.MouseEvent | React.KeyboardEvent | string;

interface IRoutesTabs {
  key: string;
  children?: React.ReactNode | undefined;
  label: string;
  closable: boolean;
  destroyInactiveTabPane: boolean;
}

export interface ICheckboxValues {
  [key: string]: boolean;
}

export enum CHECKBOX {
  ROUTE = 'routes',
  SEGMENT = 'segments',
  SECTION = 'sections',
  POINT = 'point',
  CONGESTION_CODE = 'congestion_codes',
  GUIDE_CODE = 'guide_codes',
  GUIDE = 'guides',
  SEGMENT_ROUTE = 'route_segment_map',
  CORE_SECTION = 'core_sections',
  METADATA = 'metadata',
  ERD = 'ERD',
}

export default function useRoutes() {
  const checkBoxs = [
    {
      name: CHECKBOX.ROUTE,
      label: CHECKBOX.ROUTE,
    },
    {
      name: CHECKBOX.SECTION,
      label: CHECKBOX.SECTION,
    },
    {
      name: CHECKBOX.CORE_SECTION,
      label: CHECKBOX.CORE_SECTION,
    },
    {
      name: CHECKBOX.SEGMENT,
      label: CHECKBOX.SEGMENT,
    },
    {
      name: CHECKBOX.POINT,
      label: CHECKBOX.POINT,
    },
    {
      name: CHECKBOX.SEGMENT_ROUTE,
      label: CHECKBOX.SEGMENT_ROUTE,
    },
    {
      name: CHECKBOX.GUIDE,
      label: CHECKBOX.GUIDE,
    },
    {
      name: CHECKBOX.GUIDE_CODE,
      label: CHECKBOX.GUIDE_CODE,
    },
    {
      name: CHECKBOX.CONGESTION_CODE,
      label: CHECKBOX.CONGESTION_CODE,
    },
    {
      name: CHECKBOX.METADATA,
      label: CHECKBOX.METADATA,
    },
  ];

  const content = [
    {
      name: CHECKBOX.ROUTE,
      component: Route,
    },
    {
      name: CHECKBOX.SECTION,
      component: Section,
    },
    {
      name: CHECKBOX.CORE_SECTION,
      component: CoreSection,
    },
    {
      name: CHECKBOX.SEGMENT,
      component: Segments,
    },
    {
      name: CHECKBOX.POINT,
      component: Point,
    },
    {
      name: CHECKBOX.SEGMENT_ROUTE,
      component: SegmentRoutes,
    },
    {
      name: CHECKBOX.GUIDE,
      component: Guide,
    },
    {
      name: CHECKBOX.GUIDE_CODE,
      component: GuideCode,
    },
    {
      name: CHECKBOX.CONGESTION_CODE,
      component: CongestionCode,
    },
    {
      name: CHECKBOX.METADATA,
      component: Metadata,
    },
    {
      name: CHECKBOX.ERD,
      component: ERDComponent,
    },
  ];

  const [checkboxValues, setCheckboxValues] = useState<ICheckboxValues>({
    route: false,
    section: false,
    core_section: false,
    segment: false,
    point: false,
    segment_route: false,
    guide: false,
    guide_code: false,
    congestion_code: false,
    metadata: false,
    ERD: false,
  });
  const [activeKey, setActiveKey] = useState<any>();
  const [items, setItems] = useState<IRoutesTabs[]>([]);

  useEffect(() => {
    const updateTab = items.map((item) => {
      return { ...item, closable: item.key === activeKey };
    });
    setItems(updateTab);
  }, [activeKey]);

  const hasERD = useMemo(() => {
    const listCheckbox = { ...checkboxValues };
    delete listCheckbox.ERD;
    return Object.values(listCheckbox).filter(Boolean).length >= 2;
  }, [checkboxValues]);

  const handleUpdateERD = (
    newPanes: IRoutesTabs[],
    checkboxValues: ICheckboxValues,
    key: string
  ) => {
    const findERD = newPanes.find((item) => item.key === CHECKBOX.ERD);

    if (findERD && key !== CHECKBOX.ERD) {
      newPanes = newPanes.filter((pane) => pane.key !== CHECKBOX.ERD);
      newPanes.push({
        label: CHECKBOX.ERD,
        children: <ERDComponent checkboxValues={checkboxValues} />,
        key: CHECKBOX.ERD,
        closable: false,
        destroyInactiveTabPane: true,
      });
    }

    return newPanes;
  };

  const onChangeChecbox = async (event: any) => {
    const { name, checked } = event.target;

    let updateCheckboxValues = { ...checkboxValues, [name]: checked };

    let newPanes = [...items];
    if (checked) {
      const findContent = content.find((item) => item.name === name);

      if (findContent) {
        const ContentComponent = findContent.component;

        newPanes.push({
          label: name,
          children: <ContentComponent checkboxValues={updateCheckboxValues} />,
          key: name,
          closable: false,
          destroyInactiveTabPane: name === CHECKBOX.ERD,
        });

        setActiveKey(name);
      }
    } else {
      newPanes = newPanes.filter((pane) => pane.key !== name);

      const filterTab = newPanes.filter((pane) => pane.key !== CHECKBOX.ERD);

      if (filterTab.length < 2) {
        newPanes = newPanes.filter((pane) => pane.key !== CHECKBOX.ERD);
        updateCheckboxValues = { ...updateCheckboxValues, ERD: false };
      }

      if (newPanes.length > 0) {
        setActiveKey(newPanes[0].key);
      } else {
        setActiveKey(null);
      }
    }

    setCheckboxValues(updateCheckboxValues);

    const updateNewPanes = handleUpdateERD(newPanes, updateCheckboxValues, name);
    setItems(updateNewPanes);
  };

  const onChange = (key: any) => {
    setActiveKey(key);
  };

  const remove = (targetKey: TargetKey) => {
    const targetIndex = items.findIndex((pane) => pane.key === targetKey);
    let newPanes = items.filter((pane) => pane.key !== targetKey);

    const removedPane = items[targetIndex];
    if (removedPane) {
      const { key } = removedPane;

      let updateCheckboxValues = { ...checkboxValues, [key]: false };

      const filterTab = newPanes.filter((pane) => pane.key !== CHECKBOX.ERD);

      if (filterTab.length < 2) {
        newPanes = newPanes.filter((pane) => pane.key !== CHECKBOX.ERD);
        updateCheckboxValues = { ...updateCheckboxValues, ERD: false };
      }
      setCheckboxValues(updateCheckboxValues);

      const updateNewPanes = handleUpdateERD(newPanes, updateCheckboxValues, key);
      setItems(updateNewPanes);
    }

    if (newPanes.length && targetKey === activeKey) {
      const newActiveKey =
        targetIndex === newPanes.length ? newPanes[targetIndex - 1].key : newPanes[targetIndex].key;
      setActiveKey(newActiveKey);
    }
  };

  const onEdit = (targetKey: TargetKey) => {
    remove(targetKey);
  };

  return {
    hasERD,
    checkBoxs,
    checkboxValues,
    activeKey,
    items,
    onChangeChecbox,
    onChange,
    onEdit,
  };
}
