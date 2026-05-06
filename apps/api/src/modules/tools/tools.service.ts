class ToolsService {
  calculateMortgage(params: {
    principal: number;
    annualRate: number;
    termYears: number;
    downPayment?: number;
    propertyTax?: number;
    insurance?: number;
    hoa?: number;
  }) {
    const { principal, annualRate, termYears, downPayment = 0, propertyTax = 0, insurance = 0, hoa = 0 } = params;

    const loanAmount = principal - downPayment;
    const monthlyRate = annualRate / 100 / 12;
    const numPayments = termYears * 12;

    // Monthly P&I payment formula
    const monthlyPI = loanAmount * 
      (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
      (Math.pow(1 + monthlyRate, numPayments) - 1);

    const monthlyPropertyTax = propertyTax / 12;
    const monthlyInsurance = insurance / 12;
    const totalMonthlyPayment = monthlyPI + monthlyPropertyTax + monthlyInsurance + hoa;

    const totalInterest = (monthlyPI * numPayments) - loanAmount;
    const totalCost = monthlyPI * numPayments + propertyTax * termYears + insurance * termYears + hoa * numPayments;

    return {
      loanAmount,
      monthlyPayment: Math.round(totalMonthlyPayment * 100) / 100,
      breakdown: {
        principalAndInterest: Math.round(monthlyPI * 100) / 100,
        propertyTax: Math.round(monthlyPropertyTax * 100) / 100,
        insurance: Math.round(monthlyInsurance * 100) / 100,
        hoa: hoa,
      },
      totals: {
        totalInterest: Math.round(totalInterest * 100) / 100,
        totalCost: Math.round(totalCost * 100) / 100,
      },
      amortization: this.generateAmortizationSchedule(loanAmount, monthlyRate, numPayments, monthlyPI),
    };
  }

  calculateAffordability(params: {
    annualIncome: number;
    monthlyDebts: number;
    downPayment: number;
    annualRate: number;
    termYears: number;
    propertyTaxRate?: number;
    insuranceRate?: number;
  }) {
    const { 
      annualIncome, 
      monthlyDebts, 
      downPayment, 
      annualRate, 
      termYears,
      propertyTaxRate = 1.2,
      insuranceRate = 0.5,
    } = params;

    const monthlyIncome = annualIncome / 12;
    
    // Using 28% front-end ratio and 36% back-end ratio
    const maxHousingPayment = monthlyIncome * 0.28;
    const maxTotalDebt = monthlyIncome * 0.36;
    const availableForHousing = Math.min(maxHousingPayment, maxTotalDebt - monthlyDebts);

    // Estimate taxes and insurance as percentage of home value
    const taxInsuranceRate = (propertyTaxRate + insuranceRate) / 100 / 12;
    
    // Solve for max home price
    const monthlyRate = annualRate / 100 / 12;
    const numPayments = termYears * 12;
    
    // Iterative approach to find max home price
    let maxHomePrice = 0;
    for (let price = 100000; price <= 2000000; price += 10000) {
      const loanAmount = price - downPayment;
      const monthlyPI = loanAmount * 
        (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
        (Math.pow(1 + monthlyRate, numPayments) - 1);
      const monthlyTaxInsurance = price * taxInsuranceRate;
      const totalPayment = monthlyPI + monthlyTaxInsurance;
      
      if (totalPayment <= availableForHousing) {
        maxHomePrice = price;
      } else {
        break;
      }
    }

    const loanAmount = maxHomePrice - downPayment;
    const monthlyPI = loanAmount * 
      (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
      (Math.pow(1 + monthlyRate, numPayments) - 1);

    return {
      maxHomePrice,
      loanAmount,
      downPayment,
      downPaymentPercent: Math.round((downPayment / maxHomePrice) * 100 * 10) / 10,
      estimatedMonthlyPayment: Math.round(monthlyPI * 100) / 100,
      debtToIncomeRatio: Math.round(((monthlyPI + monthlyDebts) / monthlyIncome) * 100 * 10) / 10,
      recommendations: {
        comfortable: Math.round(maxHomePrice * 0.85),
        stretch: Math.round(maxHomePrice * 1.1),
      },
    };
  }

  getCurrentRates() {
    // Mock current mortgage rates
    return {
      lastUpdated: new Date().toISOString(),
      rates: [
        { type: '30-Year Fixed', rate: 6.875, apr: 6.95, change: -0.125 },
        { type: '15-Year Fixed', rate: 6.125, apr: 6.25, change: -0.0625 },
        { type: '5/1 ARM', rate: 6.25, apr: 7.15, change: 0.0 },
        { type: '7/1 ARM', rate: 6.375, apr: 7.05, change: -0.0625 },
        { type: 'FHA 30-Year', rate: 6.5, apr: 7.35, change: -0.125 },
        { type: 'VA 30-Year', rate: 6.25, apr: 6.45, change: -0.0625 },
        { type: 'Jumbo 30-Year', rate: 7.0, apr: 7.1, change: 0.0 },
      ],
      disclaimer: 'Rates are for informational purposes only and may vary based on credit score, loan amount, and other factors.',
    };
  }

  prequalify(params: {
    annualIncome: number;
    monthlyDebts: number;
    creditScore: number;
    downPayment: number;
    employmentYears: number;
  }) {
    const { annualIncome, monthlyDebts, creditScore, downPayment, employmentYears } = params;

    const monthlyIncome = annualIncome / 12;
    const dti = (monthlyDebts / monthlyIncome) * 100;

    let status: 'LIKELY_APPROVED' | 'MAY_QUALIFY' | 'NEEDS_IMPROVEMENT' = 'NEEDS_IMPROVEMENT';
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Credit score check
    if (creditScore >= 740) {
      // Excellent
    } else if (creditScore >= 700) {
      recommendations.push('Consider improving credit score for better rates');
    } else if (creditScore >= 620) {
      issues.push('Credit score may limit loan options');
      recommendations.push('Work on improving credit score before applying');
    } else {
      issues.push('Credit score below minimum requirements for most loans');
      recommendations.push('Focus on credit repair before applying');
    }

    // DTI check
    if (dti > 43) {
      issues.push('Debt-to-income ratio is high');
      recommendations.push('Pay down existing debts to improve DTI');
    } else if (dti > 36) {
      recommendations.push('Consider reducing monthly debts for better terms');
    }

    // Down payment check
    const estimatedHomePrice = downPayment / 0.2; // Assuming 20% down
    const downPaymentPercent = (downPayment / estimatedHomePrice) * 100;
    
    if (downPaymentPercent < 3) {
      issues.push('Down payment may be insufficient');
      recommendations.push('Save for a larger down payment');
    } else if (downPaymentPercent < 20) {
      recommendations.push('Consider saving for 20% down to avoid PMI');
    }

    // Employment check
    if (employmentYears < 2) {
      issues.push('Employment history less than 2 years');
      recommendations.push('Maintain stable employment for at least 2 years');
    }

    // Determine status
    if (issues.length === 0 && creditScore >= 700 && dti <= 36) {
      status = 'LIKELY_APPROVED';
    } else if (issues.length <= 1 && creditScore >= 620 && dti <= 43) {
      status = 'MAY_QUALIFY';
    }

    const maxLoanAmount = this.calculateAffordability({
      annualIncome,
      monthlyDebts,
      downPayment,
      annualRate: 7.0,
      termYears: 30,
    }).loanAmount;

    return {
      status,
      estimatedMaxLoan: maxLoanAmount,
      estimatedMaxHomePrice: maxLoanAmount + downPayment,
      creditScore,
      debtToIncomeRatio: Math.round(dti * 10) / 10,
      issues,
      recommendations,
      nextSteps: status === 'LIKELY_APPROVED' 
        ? ['Get pre-approved with a lender', 'Start house hunting']
        : ['Address the issues listed above', 'Consult with a mortgage advisor'],
    };
  }

  private generateAmortizationSchedule(
    loanAmount: number,
    monthlyRate: number,
    numPayments: number,
    monthlyPayment: number
  ) {
    const schedule = [];
    let balance = loanAmount;

    // Only return first 12 months and yearly summaries
    for (let month = 1; month <= Math.min(numPayments, 12); month++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      balance -= principalPayment;

      schedule.push({
        month,
        payment: Math.round(monthlyPayment * 100) / 100,
        principal: Math.round(principalPayment * 100) / 100,
        interest: Math.round(interestPayment * 100) / 100,
        balance: Math.round(Math.max(0, balance) * 100) / 100,
      });
    }

    return schedule;
  }
}

export default new ToolsService();
