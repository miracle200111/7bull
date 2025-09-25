import React, { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';
import BahrainCircuitImage from '../racecircut/Bahrain_Circuit.png';

// 基于示例 f1_demo_with_user_path.html 的路径与动画逻辑，封装为可复用组件
// 说明：坐标系为 1200x800，SVG 自适应容器尺寸（保留视窗比）

const PATH_D = "M 367.28,678.22 C 326.97,679.89 303.46,679.52 298.92,679.48 C 294.38,679.45 280.74,679.43 278.22,679.40 C 275.70,679.38 270.14,679.22 268.67,679.20 C 267.20,679.18 261.66,679.42 260.59,679.20 C 259.51,678.98 256.27,677.25 255.76,676.55 C 255.25,675.85 254.37,671.83 254.45,670.81 C 254.54,669.79 256.17,665.25 256.77,664.29 C 257.38,663.33 260.08,661.22 261.74,659.30 C 263.40,657.39 274.19,644.37 276.72,641.30 C 279.26,638.23 290.72,624.53 292.13,622.48 C 293.54,620.43 293.51,617.72 293.63,616.65 C 293.76,615.57 293.69,610.73 293.63,609.59 C 293.57,608.46 293.13,603.98 292.92,603.02 C 292.71,602.05 291.67,599.74 291.13,597.97 C 290.58,596.20 287.75,585.86 286.39,581.79 C 285.04,577.71 276.22,553.25 274.91,549.08 C 273.60,544.90 271.02,533.67 270.69,531.67 C 270.36,529.67 270.86,526.11 270.93,525.06 C 271.00,524.02 270.26,527.39 271.54,519.15 C 272.81,510.91 284.08,440.38 286.27,426.17 C 288.45,411.96 295.93,360.69 297.78,348.60 C 299.63,336.51 306.66,292.02 308.44,281.09 C 310.21,270.15 317.37,228.58 319.06,217.40 C 320.76,206.22 327.56,155.10 328.78,146.94 C 330.00,138.77 333.08,122.33 333.69,119.44 C 334.30,116.55 335.42,113.30 336.07,112.28 C 336.72,111.25 340.57,107.63 341.44,107.16 C 342.31,106.69 345.51,106.71 346.50,106.67 C 347.50,106.63 352.43,106.64 353.39,106.67 C 354.35,106.69 356.91,106.71 358.02,106.95 C 359.12,107.18 365.52,108.93 366.66,109.45 C 367.79,109.97 370.93,112.81 371.60,113.19 C 372.27,113.56 373.94,113.49 374.68,113.96 C 375.42,114.44 379.26,117.93 380.48,118.94 C 381.70,119.95 387.68,124.37 389.35,126.11 C 391.02,127.85 398.55,137.30 400.56,139.84 C 402.57,142.37 411.23,153.87 413.51,156.52 C 415.78,159.18 425.70,169.28 427.86,171.70 C 430.01,174.11 437.38,183.58 439.34,185.53 C 441.30,187.49 449.71,193.62 451.32,195.15 C 452.94,196.68 457.46,202.48 458.71,203.91 C 459.97,205.34 465.26,211.33 466.42,212.36 C 467.59,213.39 471.48,215.31 472.68,216.30 C 473.89,217.28 479.63,223.11 480.87,224.15 C 482.12,225.19 486.29,228.11 487.62,228.79 C 488.95,229.47 495.23,231.64 496.86,232.34 C 498.48,233.04 505.16,236.18 507.11,237.18 C 509.07,238.18 518.22,243.55 520.31,244.33 C 522.40,245.10 530.37,245.65 532.19,246.46 C 534.01,247.27 540.85,252.78 542.13,254.08 C 543.41,255.38 546.53,260.60 547.52,262.04 C 548.50,263.47 553.20,269.60 553.93,271.27 C 554.66,272.93 556.13,280.35 556.31,282.05 C 556.49,283.76 556.02,290.07 556.05,291.77 C 556.08,293.48 556.73,300.65 556.65,302.48 C 556.58,304.32 555.30,312.04 555.16,313.77 C 555.02,315.50 555.06,321.72 554.95,323.22 C 554.84,324.72 553.89,330.03 553.79,331.75 C 553.70,333.47 553.53,342.12 553.79,343.89 C 554.06,345.67 556.14,351.41 556.94,353.00 C 557.73,354.59 562.06,361.28 563.34,362.94 C 564.61,364.60 570.74,371.42 572.27,372.90 C 573.81,374.38 580.41,379.49 581.75,380.69 C 583.10,381.89 586.86,386.05 588.39,387.34 C 589.92,388.63 598.00,394.82 600.11,396.18 C 602.21,397.54 611.22,402.05 613.66,403.67 C 616.10,405.30 626.97,413.72 629.43,415.68 C 631.88,417.63 640.57,425.17 643.12,427.16 C 645.67,429.15 657.61,437.65 660.04,439.54 C 662.48,441.43 670.55,448.44 672.36,449.83 C 674.18,451.22 680.30,455.14 681.81,456.20 C 683.31,457.26 689.56,461.41 690.42,462.56 C 691.29,463.71 692.37,468.49 692.18,470.03 C 691.98,471.56 689.04,479.54 688.07,481.00 C 687.09,482.47 681.67,487.04 680.46,487.63 C 679.25,488.23 674.92,488.17 673.55,488.15 C 672.18,488.13 665.86,487.56 663.99,487.43 C 662.13,487.31 654.86,487.04 651.19,486.64 C 647.52,486.25 625.91,483.38 619.99,482.73 C 614.07,482.08 586.41,479.68 580.19,478.85 C 573.96,478.02 551.31,473.58 545.32,472.77 C 539.32,471.95 513.78,469.60 508.24,469.06 C 502.69,468.51 483.10,466.67 478.79,466.21 C 474.47,465.76 459.06,463.79 456.48,463.59 C 453.90,463.40 449.09,463.84 447.82,463.86 C 446.55,463.88 442.26,463.83 441.23,463.86 C 440.20,463.89 436.49,464.15 435.48,464.23 C 434.48,464.31 430.20,464.43 429.17,464.84 C 428.14,465.24 424.15,468.47 423.15,469.05 C 422.15,469.63 417.83,471.21 417.14,471.79 C 416.45,472.36 415.80,475.23 414.82,475.95 C 413.85,476.67 406.83,479.36 405.43,480.43 C 404.02,481.50 399.57,487.01 397.99,488.79 C 396.41,490.57 387.60,500.20 386.45,501.75 C 385.29,503.29 384.74,506.49 384.13,507.34 C 383.51,508.20 379.62,510.99 379.02,512.00 C 378.41,513.02 376.64,518.55 376.84,519.57 C 377.04,520.59 380.34,523.84 381.43,524.25 C 382.52,524.67 388.81,524.47 389.97,524.53 C 391.14,524.58 394.12,524.77 395.39,524.95 C 396.67,525.12 402.53,526.26 405.24,526.64 C 407.96,527.03 424.80,529.18 427.95,529.57 C 431.10,529.95 440.38,530.78 443.02,531.29 C 445.67,531.80 456.65,535.34 459.69,535.66 C 462.73,535.98 474.34,534.97 479.52,535.12 C 484.70,535.27 511.71,537.21 521.85,537.45 C 531.99,537.69 590.72,537.88 601.20,538.01 C 611.68,538.14 639.57,538.85 647.62,538.99 C 655.66,539.13 689.29,539.68 697.76,539.69 C 706.23,539.70 741.42,538.98 749.24,539.13 C 757.07,539.28 785.18,541.44 791.64,541.50 C 798.09,541.56 820.78,539.83 826.73,539.81 C 832.68,539.78 857.67,541.22 863.06,541.21 C 868.44,541.20 887.62,540.27 891.37,539.67 C 895.11,539.07 906.02,535.14 908.02,534.00 C 910.03,532.86 914.58,527.45 915.43,525.99 C 916.27,524.53 917.73,518.06 918.13,516.45 C 918.52,514.84 919.96,508.29 920.16,506.66 C 920.36,505.03 920.51,498.63 920.52,496.94 C 920.52,495.25 920.39,488.10 920.22,486.41 C 920.06,484.72 919.01,478.12 918.56,476.66 C 918.11,475.21 915.49,470.42 914.82,468.95 C 914.14,467.48 911.23,460.57 910.45,458.98 C 909.68,457.38 906.33,451.35 905.50,449.84 C 904.67,448.34 901.44,442.31 900.48,440.94 C 899.52,439.57 895.08,434.69 893.97,433.37 C 892.86,432.05 888.52,426.35 887.16,425.09 C 885.81,423.84 879.41,419.40 877.73,418.32 C 876.06,417.25 869.10,413.41 867.09,412.22 C 865.08,411.04 855.54,405.07 853.64,404.10 C 851.75,403.14 846.11,401.52 844.35,400.64 C 842.59,399.77 834.59,394.57 832.54,393.61 C 830.50,392.64 821.68,389.84 819.78,389.01 C 817.87,388.18 811.37,384.41 809.66,383.68 C 807.96,382.95 801.10,381.11 799.36,380.25 C 797.62,379.40 790.51,374.74 788.79,373.45 C 787.06,372.16 779.98,365.81 778.66,364.82 C 777.34,363.84 773.71,362.57 772.92,361.63 C 772.13,360.69 770.13,354.55 769.18,353.53 C 768.22,352.51 762.57,350.67 761.46,349.42 C 760.34,348.17 756.68,340.44 755.80,338.54 C 754.91,336.63 751.39,328.32 750.81,326.61 C 750.22,324.90 749.04,319.67 748.77,318.04 C 748.50,316.40 747.85,308.73 747.55,306.98 C 747.25,305.24 745.40,298.43 745.21,297.08 C 745.01,295.74 745.19,292.01 745.21,290.87 C 745.22,289.73 745.20,284.68 745.41,283.38 C 745.62,282.09 747.25,276.52 747.73,275.30 C 748.21,274.09 750.72,269.94 751.15,268.81 C 751.59,267.68 752.50,263.27 752.95,261.77 C 753.41,260.28 753.77,257.24 756.64,250.90 C 759.52,244.55 784.51,191.82 787.46,185.64 C 790.42,179.46 791.09,178.37 792.11,176.73 C 793.13,175.09 798.37,167.21 799.67,165.96 C 800.97,164.70 806.66,162.21 807.71,161.64 C 808.77,161.07 811.29,159.82 812.38,159.11 C 813.47,158.40 819.64,153.60 820.79,153.08 C 821.93,152.55 824.92,152.80 826.11,152.80 C 827.29,152.79 833.67,152.85 834.98,153.00 C 836.29,153.14 840.78,154.40 841.82,154.53 C 842.87,154.66 846.71,154.12 847.53,154.53 C 848.36,154.94 850.68,158.54 851.71,159.48 C 852.75,160.43 858.90,164.79 860.01,165.91 C 861.12,167.02 864.37,171.62 865.00,172.83 C 865.63,174.03 865.94,177.67 867.57,180.38 C 869.20,183.08 881.74,201.01 884.57,205.31 C 887.40,209.61 898.82,227.37 901.51,231.95 C 904.19,236.53 913.97,255.80 916.77,260.29 C 919.57,264.78 932.08,281.16 935.11,285.81 C 938.14,290.46 950.39,311.57 953.13,316.08 C 955.86,320.58 965.29,335.68 967.98,339.89 C 970.66,344.09 982.70,361.88 985.37,366.55 C 988.04,371.21 997.30,391.25 999.97,395.90 C 1002.64,400.55 1014.74,418.07 1017.43,422.35 C 1020.11,426.62 1029.47,443.07 1032.16,447.21 C 1034.86,451.36 1047.23,467.81 1049.81,472.09 C 1052.39,476.38 1060.99,494.56 1063.15,498.61 C 1065.32,502.66 1073.58,516.96 1075.81,520.71 C 1078.04,524.45 1087.80,539.89 1089.93,543.55 C 1092.07,547.21 1099.61,561.82 1101.40,564.66 C 1103.20,567.49 1109.37,574.48 1111.49,577.56 C 1113.62,580.65 1124.93,598.48 1126.88,601.67 C 1128.83,604.87 1133.75,614.02 1134.91,615.88 C 1136.06,617.75 1140.11,622.68 1140.76,624.02 C 1141.41,625.37 1142.20,630.82 1142.73,632.01 C 1143.26,633.20 1146.75,637.15 1147.12,638.32 C 1147.48,639.49 1147.12,644.97 1147.12,646.06 C 1147.12,647.14 1147.41,650.43 1147.12,651.36 C 1146.82,652.29 1144.25,656.58 1143.55,657.23 C 1142.84,657.87 1139.27,658.78 1138.67,659.13 C 1138.07,659.49 1136.96,661.07 1136.34,661.48 C 1135.72,661.90 1132.13,663.58 1131.23,664.11 C 1130.34,664.63 1126.62,667.36 1125.62,667.79 C 1124.62,668.22 1120.60,668.55 1119.23,669.24 C 1117.85,669.92 1110.67,675.21 1109.12,676.03 C 1107.57,676.85 1101.73,678.80 1100.61,679.05 C 1099.49,679.31 1097.55,679.12 1095.63,679.13 C 1093.71,679.13 1081.46,679.18 1077.56,679.13 C 1073.66,679.07 1054.63,678.54 1048.84,678.48 C 1043.04,678.43 1015.43,678.51 1008.02,678.48 C 1000.60,678.46 966.43,678.22 959.87,678.15 C 953.32,678.08 935.84,677.69 929.35,677.67 C 922.85,677.65 891.29,677.90 881.93,677.90 C 872.57,677.90 829.12,677.62 817.00,677.63 C 804.88,677.64 746.22,678.00 736.48,678.04 C 726.75,678.08 707.38,678.10 700.17,678.08 C 692.95,678.06 658.33,677.85 649.89,677.79 C 641.45,677.73 608.28,677.52 598.92,677.34 C 589.57,677.16 546.45,675.71 537.64,675.68 C 528.84,675.65 502.57,676.87 493.31,676.95 C 484.05,677.02 434.24,676.63 426.51,676.58 C 418.78,676.53 405.51,676.19 400.57,676.32 C 395.64,676.46 372.94,677.93 367.28,678.22 C 361.62,678.51 338.36,679.68 332.67,679.79";

export default function PathTrack({
  vmaxBase = 520, // 直线最高速度 px/s
  kv = 1200,      // 弯道减速强度
  closed = true,  // 是否闭合路径
  // 对齐参数（单位：像素 / 角度 / 倍数）
  offsetX = 0,
  offsetY = 0,
  scale = 1,
  rotationDeg = 0,
  backgroundUrl,
  teams,
  selectedTeamKey,
  gridOrder = [],
  strategyByCarId = {},
  phase = 'race',
  raceFlag = 'green',
  active = true,
  raceStarted = false,
  currentLap = 0,
  onTelemetry
}) {
  const pathRef = useRef(null);
  const rafRef = useRef(0);
  const t0Ref = useRef(0);
  const sRef = useRef(0);
  const lapLenRef = useRef(0);

  // 本地对齐参数（可热键微调）
  const [align, setAlign] = useState({ offsetX, offsetY, scale, rotationDeg });

  // 多车状态与引用
  const [cars, setCars] = useState([]);
  const carElemsRef = useRef({});
  const carStatesRef = useRef([]); // 每车：{ s, speedK, laneIndex, lap, pitTimer, startDelay }
  const phaseRef = useRef(phase);
  const phaseStartMsRef = useRef(0);

  // 基于传入 teams 构建车辆清单
  useEffect(() => {
    if (teams && typeof teams === 'object') {
      const list = [];
      Object.values(teams).forEach((team) => {
        const teamColor = team.color || '#FF3B3B';
        const teamId = team.id || team.name || Math.random().toString(36).slice(2);
        (team.drivers || []).forEach((driver, idx) => {
          list.push({
            id: `${teamId}_${driver.id || driver.number || idx}`,
            number: driver.number || idx + 1,
            name: driver.name || `Driver ${idx + 1}`,
            teamName: team.name,
            teamColor,
            isSelectedTeam: selectedTeamKey ? (team.id === selectedTeamKey) : false
          });
        });
      });
      setCars(list);
      carStatesRef.current = [];
    } else {
      // 演示：20辆虚拟车
      const demo = Array.from({ length: 20 }).map((_, i) => ({
        id: `demo_${i}`,
        number: i + 1,
        name: `Car ${i + 1}`,
        teamName: 'Demo',
        teamColor: `hsl(${(i * 24) % 360} 80% 55%)`,
        isSelectedTeam: false
      }));
      setCars(demo);
      carStatesRef.current = [];
    }
  }, [teams, selectedTeamKey]);

  // 侦听 phase 变化
  useEffect(() => {
    if (phaseRef.current !== phase) {
      phaseRef.current = phase;
      phaseStartMsRef.current = performance.now();
    }
  }, [phase]);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;

    const getClosedD = () => {
      const d = PATH_D.trim();
      if (!closed) return d;
      return /Z\s*$/i.test(d) ? d : `${d} Z`;
    };

    path.setAttribute('d', getClosedD());
    const L = path.getTotalLength();
    lapLenRef.current = L;
    t0Ref.current = 0;

    const look = 6; // 预瞄距离（像素）

    const step = (ts) => {
      if (!t0Ref.current) t0Ref.current = ts;
      const dt = (ts - t0Ref.current) / 1000;
      t0Ref.current = ts;
      // 初始化每辆车的起始位置和参数
      if (carStatesRef.current.length !== cars.length) {
        const nowPhase = phaseRef.current;
        if (nowPhase === 'start' && cars.length > 0) {
          const baseS = 0;
          const gridGap = 18;
          carStatesRef.current = cars.map((_, i) => ({
            s: (baseS - i * gridGap + L) % L,
            speedK: 0.95 + Math.random() * 0.12,
            laneIndex: i % 4,
            lap: 0,
            pitTimer: 0,
            startDelay: Math.random() * 0.5
          }));
        } else {
          const gap = L / Math.max(1, cars.length);
          carStatesRef.current = cars.map((_, i) => ({
            s: (gap * i) % L,
            speedK: 0.95 + Math.random() * 0.12,
            laneIndex: i % 4,
            lap: 0,
            pitTimer: 0,
            startDelay: 0
          }));
        }
      }

      const lanes = [-10, -3, 3, 10];
      for (let i = 0; i < cars.length; i += 1) {
        const st = carStatesRef.current[i];
        let s = st.s;
        const p = path.getPointAtLength(s);
        const p2 = path.getPointAtLength((s + look) % L);
        const p0 = path.getPointAtLength((s + L - look) % L);

        const a1 = Math.atan2(p2.y - p.y, p2.x - p.x);
        const a0 = Math.atan2(p.y - p0.y, p.x - p0.x);
        let dth = a1 - a0;
        while (dth > Math.PI) dth -= 2 * Math.PI;
        while (dth < -Math.PI) dth += 2 * Math.PI;
        const kappa = Math.abs(dth) / (2 * look + 1e-6);

        // pace/phase/pit 影响
        let speedKAll = st.speedK;
        const carId = cars[i].id;
        const strat = strategyByCarId && strategyByCarId[carId];
        if (strat && typeof strat.paceK === 'number') speedKAll *= strat.paceK;

        const nowMs = performance.now();
        const phaseMs = nowMs - phaseStartMsRef.current;
        let startFactor = 1;
        if (phaseRef.current === 'start') {
          const released = phaseMs > (st.startDelay * 1000);
          startFactor = released ? 0.85 : 0;
        }

        // pit 检查：过线增加圈数，并在计划圈进入 pit
        const nextSProbe = (s + 1) % L;
        if (nextSProbe < s) {
          st.lap = (st.lap || 0) + 1;
        }
        if (strat && Array.isArray(strat.plannedPitLaps) && (st.pitTimer || 0) <= 0) {
          if (strat.plannedPitLaps.includes(st.lap || 0)) {
            st.pitTimer = strat.pitSeconds || 2.5;
          }
        }
        if ((st.pitTimer || 0) > 0) {
          st.pitTimer = Math.max(0, st.pitTimer - dt);
        }

        // 胎温/磨损简化模型
        const distanceStep = Math.max(0, (vmaxBase / (1 + kv * kappa)) * dt);
        st.tyreWear = (st.tyreWear || 0) + distanceStep * 0.0005;
        const wearFactor = Math.max(0.8, 1 - Math.min(0.2, st.tyreWear));

        // 只有比赛开始后才移动
        const raceFactor = raceStarted ? 1 : 0;
        
        const vmax = Math.max(120, (vmaxBase / (1 + kv * kappa)) * speedKAll * startFactor * wearFactor * flagFactor * raceFactor * ((st.pitTimer || 0) > 0 ? 0 : 1));
        const sNext = (s + vmax * dt) % L;
        st.s = sNext;

        const p1 = path.getPointAtLength(sNext);
        const dir = path.getPointAtLength((sNext + 1) % L);
        const ang = Math.atan2(dir.y - p1.y, dir.x - p1.x) * 180 / Math.PI;

        // 根据车道做横向偏移
        const laneShift = lanes[st.laneIndex] || 0;
        const rad = (ang + 90) * Math.PI / 180;
        const lx = p1.x + Math.cos(rad) * laneShift;
        const ly = p1.y + Math.sin(rad) * laneShift;

        const el = carElemsRef.current[cars[i].id];
        if (el) el.setAttribute('transform', `translate(${lx.toFixed(2)},${ly.toFixed(2)}) rotate(${ang.toFixed(2)})`);
      }

      // 遥测输出
      if (typeof onTelemetry === 'function') {
        const states = carStatesRef.current.map((st, idx) => ({
          id: cars[idx].id,
          name: cars[idx].name,
          teamName: cars[idx].teamName,
          teamColor: cars[idx].teamColor,
          lap: st.lap || 0,
          s: st.s,
          total: (st.lap || 0) * L + st.s
        }));
        const ordered = [...states].sort((a, b) => b.total - a.total);
        const leader = ordered[0]?.total || 0;
        const withGaps = ordered.map((c, pos) => ({
          ...c,
          position: pos + 1,
          gapMeters: leader - c.total
        }));
        onTelemetry(withGaps);
      }
      rafRef.current = requestAnimationFrame(step);
    };

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [vmaxBase, kv, closed, cars.length]);

  // 轻量对齐热键：方向键/WASD 平移，[ / ] 旋转，- / = 缩放，0 重置
  useEffect(() => {
    const onKey = (e) => {
      const next = { ...align };
      let changed = false;
      const step = e.shiftKey ? 25 : 5;
      const rotStep = e.shiftKey ? 2 : 1;
      const sclStep = e.shiftKey ? 0.05 : 0.02;
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A': next.offsetX -= step; changed = true; break;
        case 'ArrowRight':
        case 'd':
        case 'D': next.offsetX += step; changed = true; break;
        case 'ArrowUp':
        case 'w':
        case 'W': next.offsetY -= step; changed = true; break;
        case 'ArrowDown':
        case 's':
        case 'S': next.offsetY += step; changed = true; break;
        case '[': next.rotationDeg -= rotStep; changed = true; break;
        case ']': next.rotationDeg += rotStep; changed = true; break;
        case '-': next.scale = Math.max(0.1, next.scale - sclStep); changed = true; break;
        case '=':
        case '+': next.scale = Math.min(10, next.scale + sclStep); changed = true; break;
        case '0': next.offsetX = 0; next.offsetY = 0; next.scale = 1; next.rotationDeg = 0; changed = true; break;
        default: break;
      }
      if (changed) {
        setAlign(next);
        // eslint-disable-next-line no-console
        console.log('[align]', next);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [align]);

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {/* 背景图：巴林赛道 */}
      <Box
        sx={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${backgroundUrl || BahrainCircuitImage})`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'brightness(1.05) contrast(1.2)',
          zIndex: 1
        }}
      />

      {/* SVG 路径与赛车 */}
      <svg width="100%" height="100%" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid meet" style={{ position: 'relative', zIndex: 2 }}>
        <defs>
          <filter id="trackGlow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 以赛道中心为基点(600,400)进行缩放/旋转，再做平移 */}
        {(() => {
          const cx = 600, cy = 400;
          const transform = `translate(${align.offsetX},${align.offsetY}) translate(${cx},${cy}) rotate(${align.rotationDeg}) scale(${align.scale}) translate(${-cx},${-cy})`;
          return (
            <g transform={transform}>
              {/* 中心线路径（用于动画与校准）*/}
              <path
                ref={pathRef}
                d={PATH_D}
                fill="none"
                stroke="#ff4d4f"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#trackGlow)"
              />

              {/* 多车渲染 */}
              {cars.map((car) => (
                <g key={car.id} ref={(el) => { if (el) carElemsRef.current[car.id] = el; }}>
                  <rect
                    x="-14" y="-7" width="28" height="14" rx="3"
                    fill={car.teamColor}
                    stroke={car.isSelectedTeam ? '#FFD700' : '#0b0d10'}
                    strokeWidth={car.isSelectedTeam ? 3 : 1}
                  />
                  <circle cx="-8" cy="-7" r="2" fill="#0b0d10" />
                  <circle cx="8" cy="-7" r="2" fill="#0b0d10" />
                  <circle cx="-8" cy="7" r="2" fill="#0b0d10" />
                  <circle cx="8" cy="7" r="2" fill="#0b0d10" />
                </g>
              ))}
            </g>
          );
        })()}
      </svg>
      {/* 对齐HUD */}
      <Box sx={{ position: 'absolute', top: 10, left: 10, zIndex: 3, background: 'rgba(0,0,0,0.65)', color: '#fff', fontSize: 12, px: 1, py: 0.5, border: '1px solid rgba(255,255,255,0.2)', borderRadius: 1 }}>
        x: {Math.round(align.offsetX)} | y: {Math.round(align.offsetY)} | s: {align.scale.toFixed(3)} | r: {align.rotationDeg.toFixed(1)}°
      </Box>
    </Box>
  );
}


